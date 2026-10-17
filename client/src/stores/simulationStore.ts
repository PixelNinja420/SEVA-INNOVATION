import { create } from 'zustand';
import { SimulationState, SimulationScenario, SimulationEvent, Transformer } from '@/types';
import { MOCK_TRANSFORMERS } from '@/services/api';

interface SimulationStore {
  state: SimulationState;
  transformers: Transformer[];
  events: SimulationEvent[];
  timerId: number | null;

  // Lifecycle Controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  stepForward: () => void;
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  setScenario: (scenario: SimulationScenario) => void;

  // Injection Actions
  injectPeak: () => void;
  dropSolar: () => void;
  surgeEV: () => void;
  increaseHVAC: () => void;
  sensorFailure: () => void;
  applyKnapsackMitigation: () => void;
  addEvent: (event: Omit<SimulationEvent, 'id' | 'timestamp'>) => void;
}

const INITIAL_TIME = '18:15:00';

export const useSimulationStore = create<SimulationStore>((set, get) => {
  // Helper to advance simulated clock
  const advanceTime = (currentTime: string, secondsToAdd = 60): string => {
    const [h, m, s] = currentTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, s + secondsToAdd);
    return date.toTimeString().split(' ')[0];
  };

  const tickSimulation = () => {
    const { state, transformers } = get();
    const newTime = advanceTime(state.simulatedTime, 30 * state.speed);

    // Dynamic thermal & load drift based on scenario
    const updatedTransformers = transformers.map((tr) => {
      if (tr.status === 'OFFLINE') return tr;

      let loadDelta = (Math.random() - 0.48) * 1.5;
      if (state.scenario === 'EVENING_PEAK') loadDelta += 0.8;
      if (state.scenario === 'HEATWAVE') loadDelta += 1.2;

      const newLoad = Math.max(10, Math.min(tr.capacityKVA * 1.25, tr.currentLoadKW + loadDelta));
      const newLoadingPct = parseFloat(((newLoad / tr.capacityKVA) * 100).toFixed(1));

      // Thermal lag simulation: oil temp slowly tracks loading
      const targetOilTemp = 30 + (newLoadingPct / 100) * 55;
      const oilTempDelta = (targetOilTemp - tr.oilTemperature) * 0.05;
      const newOilTemp = parseFloat((tr.oilTemperature + oilTempDelta).toFixed(1));

      let newStatus = tr.status;
      let newRisk = tr.riskLevel;

      if (newLoadingPct >= 100 || newOilTemp >= 90) {
        newStatus = 'CRITICAL';
        newRisk = 'CRITICAL';
      } else if (newLoadingPct >= 85 || newOilTemp >= 75) {
        newStatus = 'WARNING';
        newRisk = 'HIGH';
      } else if (newLoadingPct >= 70) {
        newStatus = 'WATCH';
        newRisk = 'MEDIUM';
      } else {
        newStatus = 'NORMAL';
        newRisk = 'LOW';
      }

      return {
        ...tr,
        currentLoadKW: parseFloat(newLoad.toFixed(1)),
        loadingPercentage: newLoadingPct,
        oilTemperature: newOilTemp,
        windingTemperature: parseFloat((newOilTemp + (newLoadingPct / 100) * 12).toFixed(1)),
        status: newStatus,
        riskLevel: newRisk,
        isOverloaded: newLoadingPct >= 100,
        lastTelemetryTimestamp: new Date().toISOString(),
      };
    });

    set({
      state: {
        ...state,
        simulatedTime: newTime,
        stepCount: state.stepCount + 1,
      },
      transformers: updatedTransformers,
    });
  };

  return {
    state: {
      simulatedTime: INITIAL_TIME,
      status: 'IDLE',
      speed: 1,
      scenario: 'EVENING_PEAK',
      ambientTemperatureC: 33.5,
      solarRadiationPct: 15,
      gridFrequencyHz: 49.98,
      stepCount: 0,
    },
    transformers: MOCK_TRANSFORMERS,
    events: [
      {
        id: 'evt-init',
        timestamp: '18:15:00',
        type: 'PEAK_INJECT',
        severity: 'INFO',
        message: 'Simulation Lab initialized: Evening Peak Scenario Active in Panaji Sector.',
      },
    ],
    timerId: null,

    start: () => {
      const { timerId } = get();
      if (timerId) clearInterval(timerId);

      const id = window.setInterval(() => {
        tickSimulation();
      }, 1000);

      set((s) => ({
        state: { ...s.state, status: 'RUNNING' },
        timerId: id,
      }));
    },

    pause: () => {
      const { timerId } = get();
      if (timerId) clearInterval(timerId);
      set((s) => ({
        state: { ...s.state, status: 'PAUSED' },
        timerId: null,
      }));
    },

    resume: () => {
      get().start();
    },

    stop: () => {
      const { timerId } = get();
      if (timerId) clearInterval(timerId);
      set((s) => ({
        state: { ...s.state, status: 'STOPPED' },
        timerId: null,
      }));
    },

    reset: () => {
      const { timerId } = get();
      if (timerId) clearInterval(timerId);
      set({
        state: {
          simulatedTime: INITIAL_TIME,
          status: 'IDLE',
          speed: 1,
          scenario: 'EVENING_PEAK',
          ambientTemperatureC: 33.5,
          solarRadiationPct: 15,
          gridFrequencyHz: 49.98,
          stepCount: 0,
        },
        transformers: MOCK_TRANSFORMERS,
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: INITIAL_TIME,
            type: 'PEAK_INJECT',
            severity: 'INFO',
            message: 'Simulation reset to baseline state.',
          },
        ],
        timerId: null,
      });
    },

    stepForward: () => {
      tickSimulation();
    },

    setSpeed: (speed) => {
      const { state, timerId } = get();
      if (timerId) clearInterval(timerId);

      let newTimer: number | null = null;
      if (state.status === 'RUNNING') {
        newTimer = window.setInterval(() => {
          tickSimulation();
        }, 1000 / speed);
      }

      set({
        state: { ...state, speed },
        timerId: newTimer,
      });
    },

    setScenario: (scenario) => {
      set((s) => ({
        state: {
          ...s.state,
          scenario,
          ambientTemperatureC: scenario === 'HEATWAVE' ? 39.2 : 33.5,
          solarRadiationPct: scenario === 'SOLAR_DROP' ? 2 : 15,
        },
      }));
      get().addEvent({
        type: 'PEAK_INJECT',
        severity: 'WARNING',
        message: `Scenario switched to: ${scenario.replace('_', ' ')}`,
      });
    },

    injectPeak: () => {
      set((s) => ({
        transformers: s.transformers.map((tr) =>
          tr.id === 'TR-PAN-101'
            ? {
                ...tr,
                currentLoadKW: 108.5,
                loadingPercentage: 108.5,
                oilTemperature: 94.2,
                status: 'CRITICAL',
                riskLevel: 'CRITICAL',
                isOverloaded: true,
              }
            : tr
        ),
      }));
      get().addEvent({
        type: 'PEAK_INJECT',
        severity: 'CRITICAL',
        message: '⚡ Manual Overload Injected: Panaji City Center DT-01 surged to 108.5% (Overload Trip Hazard!)',
        transformerId: 'TR-PAN-101',
      });
    },

    dropSolar: () => {
      set((s) => ({
        state: { ...s.state, solarRadiationPct: 3 },
        transformers: s.transformers.map((tr) => ({
          ...tr,
          currentLoadKW: parseFloat((tr.currentLoadKW * 1.12).toFixed(1)),
          loadingPercentage: parseFloat(((tr.currentLoadKW * 1.12 / tr.capacityKVA) * 100).toFixed(1)),
        })),
      }));
      get().addEvent({
        type: 'SOLAR_DROP',
        severity: 'WARNING',
        message: '☀️ Rooftop Solar Dropped to 3%: 85% generation drop transferred directly onto distribution transformers.',
      });
    },

    surgeEV: () => {
      set((s) => ({
        transformers: s.transformers.map((tr) =>
          tr.id === 'TR-PAN-101'
            ? {
                ...tr,
                currentLoadKW: parseFloat((tr.currentLoadKW + 18.2).toFixed(1)),
                loadingPercentage: parseFloat((((tr.currentLoadKW + 18.2) / tr.capacityKVA) * 100).toFixed(1)),
                status: 'CRITICAL',
                riskLevel: 'CRITICAL',
              }
            : tr
        ),
      }));
      get().addEvent({
        type: 'EV_SURGE',
        severity: 'CRITICAL',
        message: '🚗 Cluster EV Surge Detected: +18.2 kW sudden demand surge from 5 commuter fast chargers.',
        transformerId: 'TR-PAN-101',
      });
    },

    increaseHVAC: () => {
      set((s) => ({
        state: { ...s.state, ambientTemperatureC: 38.5 },
        transformers: s.transformers.map((tr) => ({
          ...tr,
          ambientTemperature: 38.5,
          currentLoadKW: parseFloat((tr.currentLoadKW * 1.08).toFixed(1)),
          loadingPercentage: parseFloat(((tr.currentLoadKW * 1.08 / tr.capacityKVA) * 100).toFixed(1)),
        })),
      }));
      get().addEvent({
        type: 'HVAC_SPIKE',
        severity: 'WARNING',
        message: '🌡️ Ambient Heatwave Spike: 38.5°C driving continuous compressor cycling across residential sectors.',
      });
    },

    sensorFailure: () => {
      set((s) => ({
        transformers: s.transformers.map((tr) =>
          tr.id === 'TR-POR-301'
            ? { ...tr, status: 'OFFLINE', currentLoadKW: 0, loadingPercentage: 0 }
            : tr
        ),
      }));
      get().addEvent({
        type: 'SENSOR_FAILURE',
        severity: 'CRITICAL',
        message: '📡 Telemetry Drop: Porvorim Secretariat Ring DT lost MQTT heartbeat (Simulated Sensor Dropout).',
        transformerId: 'TR-POR-301',
      });
    },

    applyKnapsackMitigation: () => {
      set((s) => ({
        transformers: s.transformers.map((tr) =>
          tr.id === 'TR-PAN-101'
            ? {
                ...tr,
                currentLoadKW: 81.0,
                loadingPercentage: 81.0,
                oilTemperature: 74.0,
                status: 'NORMAL',
                riskLevel: 'LOW',
                isOverloaded: false,
              }
            : tr
        ),
      }));
      get().addEvent({
        type: 'LOAD_NORMALIZED',
        severity: 'SUCCESS',
        message: '✅ Knapsack DR Mitigation Activated: 17.4 kW shed. Panaji DT-01 returned safely to 81% loading.',
        transformerId: 'TR-PAN-101',
      });
    },

    addEvent: (evt) => {
      const newEvt: SimulationEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: get().state.simulatedTime,
        ...evt,
      };
      set((s) => ({
        events: [newEvt, ...s.events.slice(0, 49)],
      }));
    },
  };
});
