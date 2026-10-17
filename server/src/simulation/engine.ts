import { getDb } from '../database/connection.js';
import { predictTransformerRisk } from '../prediction/engine.js';
import { v4 as uuidv4 } from 'uuid';

export interface SimulationEvent {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  transformerId?: string;
  timestamp: string;
}

export interface SimulationStateData {
  status: 'stopped' | 'running' | 'paused';
  speed: number;
  simTime: string;
  scenarioId: string;
  scenarioName: string;
  seed: number;
  solarGenKw: number;
  totalDemandKw: number;
  criticalTransformersCount: number;
  warningTransformersCount: number;
}

class Mulberry32PRNG {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export class SimulationEngine {
  private static instance: SimulationEngine | null = null;

  private status: 'stopped' | 'running' | 'paused' = 'paused';
  private speed: number = 1.0; // 1 second real-time = 1 sim minute * speed
  private simTime: Date = new Date();
  private scenarioId: string = 'scen-normal-day';
  private scenarioConfig: any = { baseLoadFactor: 1.0, solarFactor: 1.0, tempOffsetC: 0 };
  private seed: number = 42;
  private prng: Mulberry32PRNG = new Mulberry32PRNG(42);

  private intervalHandle: NodeJS.Timeout | null = null;
  private broadcastCallbacks: Array<(data: any) => void> = [];
  private recentEvents: SimulationEvent[] = [];

  private constructor() {
    this.loadStateFromDb();
  }

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public subscribe(cb: (data: any) => void): () => void {
    this.broadcastCallbacks.push(cb);
    return () => {
      this.broadcastCallbacks = this.broadcastCallbacks.filter(c => c !== cb);
    };
  }

  private broadcast(data: any): void {
    for (const cb of this.broadcastCallbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error('Error in simulation broadcast subscriber:', err);
      }
    }
  }

  public loadStateFromDb(): void {
    try {
      const db = getDb();
      const row = db.prepare('SELECT * FROM simulation_state WHERE id = 1').get() as any;
      if (row) {
        this.status = row.status || 'paused';
        this.speed = row.speed || 1.0;
        this.scenarioId = row.scenario_id || 'scen-normal-day';
        this.seed = row.seed || 42;
        this.prng = new Mulberry32PRNG(this.seed);
        if (row.sim_time) {
          this.simTime = new Date(row.sim_time);
        }
      }

      const scenRow = db.prepare('SELECT * FROM simulation_scenarios WHERE id = ?').get(this.scenarioId) as any;
      if (scenRow && scenRow.config) {
        this.scenarioConfig = JSON.parse(scenRow.config);
      }
    } catch (err) {
      console.warn('Could not load simulation state from DB (may be first run):', err);
    }
  }

  public getState(): SimulationStateData {
    const db = getDb();
    const stats = db.prepare(`
      SELECT 
        SUM(current_load_kw) as total_load,
        COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count
      FROM transformers
    `).get() as any;

    const hour = this.simTime.getHours() + this.simTime.getMinutes() / 60;
    const solarGen = this.calculateSolarGen(hour);

    return {
      status: this.status,
      speed: this.speed,
      simTime: this.simTime.toISOString(),
      scenarioId: this.scenarioId,
      scenarioName: this.scenarioConfig?.name || this.scenarioId,
      seed: this.seed,
      solarGenKw: parseFloat(solarGen.toFixed(2)),
      totalDemandKw: parseFloat((stats?.total_load || 0).toFixed(2)),
      criticalTransformersCount: stats?.critical_count || 0,
      warningTransformersCount: stats?.warning_count || 0
    };
  }

  public getRecentEvents(): SimulationEvent[] {
    return this.recentEvents.slice(-20);
  }

  public start(): void {
    if (this.status === 'running') return;
    this.status = 'running';
    this.persistState();

    if (!this.intervalHandle) {
      this.intervalHandle = setInterval(() => {
        if (this.status === 'running') {
          this.step();
        }
      }, 2000); // 2 second tick
    }

    this.broadcast({ type: 'SIMULATION_STATE_CHANGE', state: this.getState() });
  }

  public pause(): void {
    this.status = 'paused';
    this.persistState();
    this.broadcast({ type: 'SIMULATION_STATE_CHANGE', state: this.getState() });
  }

  public resume(): void {
    this.start();
  }

  public stop(): void {
    this.status = 'stopped';
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.persistState();
    this.broadcast({ type: 'SIMULATION_STATE_CHANGE', state: this.getState() });
  }

  public reset(seed: number = 42): void {
    this.seed = seed;
    this.prng = new Mulberry32PRNG(seed);
    this.simTime = new Date();
    this.simTime.setHours(17, 30, 0, 0); // start at 5:30 PM for peak demo
    this.recentEvents = [];
    this.step();
    this.persistState();
    this.broadcast({ type: 'SIMULATION_RESET', state: this.getState() });
  }

  public setSpeed(speed: number): void {
    this.speed = Math.max(0.1, Math.min(20, speed));
    this.persistState();
    this.broadcast({ type: 'SIMULATION_STATE_CHANGE', state: this.getState() });
  }

  public setScenario(scenarioId: string): void {
    try {
      const db = getDb();
      const row = db.prepare('SELECT * FROM simulation_scenarios WHERE id = ?').get(scenarioId) as any;
      if (row) {
        this.scenarioId = row.id;
        this.scenarioConfig = JSON.parse(row.config);
        this.persistState();
        this.broadcast({
          type: 'SCENARIO_CHANGED',
          scenarioId: this.scenarioId,
          scenarioName: row.name,
          state: this.getState()
        });
      }
    } catch (err) {
      console.error('Failed to set scenario:', err);
    }
  }

  public injectEvent(eventType: string, params: any = {}): SimulationEvent {
    const event: SimulationEvent = {
      id: uuidv4(),
      type: eventType,
      severity: params.severity || 'warning',
      message: params.message || `Simulation event injected: ${eventType}`,
      transformerId: params.transformerId,
      timestamp: this.simTime.toISOString()
    };

    if (eventType === 'solar_drop') {
      this.scenarioConfig.solarFactor = (this.scenarioConfig.solarFactor || 1.0) * 0.25;
      event.message = 'Sudden monsoon cloud cover caused a 75% drop in solar generation!';
      event.severity = 'warning';
    } else if (eventType === 'ev_surge') {
      this.scenarioConfig.evChargingSurge = (this.scenarioConfig.evChargingSurge || 1.0) * 2.5;
      event.message = 'Coordinated EV fast-charging surge initiated across regional clusters!';
      event.severity = 'warning';
    } else if (eventType === 'heatwave_spike') {
      this.scenarioConfig.tempOffsetC = (this.scenarioConfig.tempOffsetC || 0) + 6;
      event.message = 'Extreme ambient temperature surge (+6°C) increased air conditioning load!';
      event.severity = 'critical';
    } else if (eventType === 'overload_spike' && params.transformerId) {
      try {
        const db = getDb();
        const tr = db.prepare('SELECT capacity_kva, power_factor FROM transformers WHERE id = ?').get(params.transformerId) as any;
        if (tr) {
          const overloadKw = tr.capacity_kva * tr.power_factor * 0.98;
          db.prepare('UPDATE transformers SET current_load_kw = ?, loading_pct = 98.0, status = "critical", risk_level = "CRITICAL" WHERE id = ?')
            .run(overloadKw, params.transformerId);
          event.message = `Forced overload injection on transformer ${params.transformerId} to 98% loading.`;
          event.severity = 'critical';
        }
      } catch (e) {
        console.error(e);
      }
    }

    this.recentEvents.push(event);
    this.broadcast({ type: 'SIMULATION_EVENT', event });
    return event;
  }

  /**
   * Advances the simulation by 1 step (simulates 5 minutes per step * speed factor)
   */
  public step(): void {
    const minutesToAdvance = 5 * this.speed;
    this.simTime = new Date(this.simTime.getTime() + minutesToAdvance * 60 * 1000);

    const hour = this.simTime.getHours() + this.simTime.getMinutes() / 60;
    const baseDemandFactor = this.calculateBaseDemandFactor(hour);
    const solarFactor = this.calculateSolarGen(hour);
    const ambientTemp = this.calculateAmbientTemp(hour);

    const db = getDb();

    // Fetch transformers and their connected consumers count
    const transformers = db.prepare('SELECT * FROM transformers').all() as any[];
    const updateTransformer = db.prepare(`
      UPDATE transformers SET
        current_load_kw = ?,
        loading_pct = ?,
        temperature_c = ?,
        forecast_load_kw = ?,
        risk_level = ?,
        status = ?,
        last_telemetry_at = ?
      WHERE id = ?
    `);

    const insertTelemetry = db.prepare(`
      INSERT INTO telemetry_readings (id, transformer_id, device_id, sensor_type, value, unit, quality, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updatedTransformersList: any[] = [];
    const nowIso = this.simTime.toISOString();

    const updateTx = db.transaction(() => {
      for (const tr of transformers) {
        // Individual transformer random variation
        const jitter = (this.prng.next() - 0.5) * 0.08;
        const evSurge = (hour >= 18 && hour <= 21.5) ? (this.scenarioConfig.evChargingSurge || 1.0) : 1.0;
        const hvacMult = (this.scenarioConfig.hvacMultiplier || 1.0);
        const scenarioBase = (this.scenarioConfig.baseLoadFactor || 1.0);

        // Targeted scenario overrides
        let targetBoost = 1.0;
        if (this.scenarioConfig.targetDTId === tr.id) {
          targetBoost = 1.45;
        }

        // Calculate load
        const ratedKw = tr.capacity_kva * tr.power_factor;
        const nominalLoadRatio = 0.55;
        let calculatedLoadRatio = nominalLoadRatio * baseDemandFactor * scenarioBase * evSurge * hvacMult * targetBoost + jitter;

        // Rooftop solar offset (net metering subtracts from daytime load)
        const solarOffsetRatio = (solarFactor / 100) * 0.18 * (this.scenarioConfig.solarFactor || 1.0);
        calculatedLoadRatio = Math.max(0.15, calculatedLoadRatio - solarOffsetRatio);

        const currentLoadKw = parseFloat(Math.min(ratedKw * 1.25, ratedKw * calculatedLoadRatio).toFixed(2));
        const loadingPct = parseFloat(((currentLoadKw / ratedKw) * 100).toFixed(1));

        // Temperature model: T = T_ambient + (loading_pct/100)^2 * T_rise_rated
        const ratedRise = 55.0; // °C
        const tempC = parseFloat((ambientTemp + Math.pow(loadingPct / 100, 2) * ratedRise + (this.prng.next() - 0.5) * 1.5).toFixed(1));

        // Status classification
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        let riskLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' = 'NORMAL';

        if (loadingPct >= 92) {
          status = 'critical';
          riskLevel = 'CRITICAL';
        } else if (loadingPct >= 80) {
          status = 'warning';
          riskLevel = 'WARNING';
        } else if (loadingPct >= 65) {
          riskLevel = 'WATCH';
        }

        const forecastKw = parseFloat((currentLoadKw * (1 + (hour >= 17 && hour <= 20 ? 0.04 : -0.01))).toFixed(2));

        updateTransformer.run(
          currentLoadKw,
          loadingPct,
          tempC,
          forecastKw,
          riskLevel,
          status,
          nowIso,
          tr.id
        );

        // Record telemetry reading
        insertTelemetry.run(uuidv4(), tr.id, `IOT-${tr.name}`, 'active_power_kw', currentLoadKw, 'kW', 'good', nowIso);
        insertTelemetry.run(uuidv4(), tr.id, `IOT-${tr.name}`, 'top_oil_temp_c', tempC, '°C', 'good', nowIso);

        // Check if an alert event should be raised
        if (loadingPct >= 92 && tr.status !== 'critical') {
          const criticalEvt: SimulationEvent = {
            id: uuidv4(),
            type: 'TRANSFORMER_CRITICAL_OVERLOAD',
            severity: 'critical',
            message: `Transformer ${tr.name} entered CRITICAL state at ${loadingPct}% capacity!`,
            transformerId: tr.id,
            timestamp: nowIso
          };
          this.recentEvents.push(criticalEvt);
          this.broadcast({ type: 'SIMULATION_EVENT', event: criticalEvt });
        }

        updatedTransformersList.push({
          id: tr.id,
          name: tr.name,
          region_id: tr.region_id,
          current_load_kw: currentLoadKw,
          loading_pct: loadingPct,
          temperature_c: tempC,
          status,
          risk_level: riskLevel,
          forecast_load_kw: forecastKw,
          last_telemetry_at: nowIso
        });
      }
    });

    updateTx();
    this.persistState();

    const state = this.getState();
    this.broadcast({
      type: 'SIMULATION_TICK',
      simTime: nowIso,
      state,
      transformers: updatedTransformersList
    });
  }

  // Key Formula: P_solar = P_peak * max(0, sin(pi * (hour - 6) / 12)) for 6am-6pm
  private calculateSolarGen(hour: number): number {
    if (hour < 6.0 || hour >= 18.0) return 0;
    const peakKw = 100.0;
    const sinVal = Math.sin((Math.PI * (hour - 6.0)) / 12.0);
    return Math.max(0, peakKw * sinVal * (this.scenarioConfig.solarFactor || 1.0));
  }

  private calculateAmbientTemp(hour: number): number {
    const baseTemp = 27.0;
    const diurnalSwing = 8.0;
    // Peak temperature around 14:00 (hour 14)
    const tempAngle = ((hour - 6.0) / 16.0) * Math.PI;
    const sinComponent = hour >= 6 && hour <= 22 ? Math.sin(tempAngle) : 0;
    return baseTemp + diurnalSwing * Math.max(0, sinComponent) + (this.scenarioConfig.tempOffsetC || 0);
  }

  private calculateBaseDemandFactor(hour: number): number {
    // 24-hour demand curve
    if (hour >= 0 && hour < 5) return 0.45; // nighttime low
    if (hour >= 5 && hour < 9) return 0.85; // morning ramp
    if (hour >= 9 && hour < 17) return 0.70; // daytime baseline
    if (hour >= 17 && hour < 22) return 1.35; // evening peak (duck curve)
    return 0.65; // late night taper
  }

  private persistState(): void {
    try {
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO simulation_state (id, scenario_id, status, speed, sim_time, seed, started_at, created_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        this.scenarioId,
        this.status,
        this.speed,
        this.simTime.toISOString(),
        this.seed,
        this.status === 'running' ? new Date().toISOString() : null
      );
    } catch (e) {
      console.error('Failed to persist simulation state to DB:', e);
    }
  }
}
