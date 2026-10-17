import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './connection.js';
import { setupDatabase } from './setup.js';

export async function seedDatabase(dbPath?: string): Promise<void> {
  // Ensure setup has been called
  try { getDb(dbPath); } catch { await setupDatabase(dbPath); }
  const db = getDb(dbPath);
  console.log('Seeding Urja-Sync database...');

  // Wrap everything in a transaction for speed and atomicity
  const seedTx = db.transaction(() => {
    const now = new Date().toISOString();

    // Clear existing data in reverse order of foreign keys
    db.prepare('DELETE FROM audit_logs').run();
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM maintenance_records').run();
    db.prepare('DELETE FROM v2g_resources').run();
    db.prepare('DELETE FROM batteries').run();
    db.prepare('DELETE FROM reward_transactions').run();
    db.prepare('DELETE FROM campaign_consumers').run();
    db.prepare('DELETE FROM demand_response_campaigns').run();
    db.prepare('DELETE FROM reward_policies').run();
    db.prepare('DELETE FROM simulation_state').run();
    db.prepare('DELETE FROM simulation_scenarios').run();
    db.prepare('DELETE FROM prediction_results').run();
    db.prepare('DELETE FROM telemetry_readings').run();
    db.prepare('DELETE FROM appliances').run();
    db.prepare('DELETE FROM consumers').run();
    db.prepare('DELETE FROM transformers').run();
    db.prepare('DELETE FROM feeders').run();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM regions').run();
    db.prepare('DELETE FROM discoms').run();
    db.prepare('DELETE FROM organizations').run();
    db.prepare('DELETE FROM system_settings').run();

    // 1. Organization
    const orgId = 'org-india-grid';
    db.prepare('INSERT INTO organizations (id, name, created_at) VALUES (?, ?, ?)')
      .run(orgId, 'India Grid Corp', now);

    // 2. DISCOMs
    const discomsData = [
      { id: 'discom-ged', name: 'Goa Electricity Dept', state: 'Goa' },
      { id: 'discom-msedcl', name: 'MSEDCL (Maharashtra State Electricity)', state: 'Maharashtra' },
      { id: 'discom-guvnl', name: 'GUVNL (Gujarat Urja Vikas Nigam)', state: 'Gujarat' },
      { id: 'discom-bescom', name: 'BESCOM (Bangalore Electricity Supply)', state: 'Karnataka' },
      { id: 'discom-tsspdcl', name: 'TSSPDCL (Telangana Southern Power)', state: 'Telangana' }
    ];

    const insertDiscom = db.prepare(
      'INSERT INTO discoms (id, name, organization_id, state, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const d of discomsData) {
      insertDiscom.run(d.id, d.name, orgId, d.state, now);
    }

    // 3. Regions in Goa
    const goaRegionsData = [
      { id: 'reg-panaji', name: 'Panaji', level: 'division', lat: 15.4909, lng: 73.8278 },
      { id: 'reg-margao', name: 'Margao', level: 'division', lat: 15.2736, lng: 73.9580 },
      { id: 'reg-vasco', name: 'Vasco da Gama', level: 'division', lat: 15.3982, lng: 73.8113 },
      { id: 'reg-ponda', name: 'Ponda', level: 'division', lat: 15.4026, lng: 74.0086 },
      { id: 'reg-curchorem', name: 'Curchorem', level: 'division', lat: 15.2598, lng: 74.1097 }
    ];

    const insertRegion = db.prepare(
      'INSERT INTO regions (id, name, discom_id, state, parent_region_id, level, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const r of goaRegionsData) {
      insertRegion.run(r.id, r.name, 'discom-ged', 'Goa', null, r.level, r.lat, r.lng, now);
    }

    // 4. Feeders & Transformers
    const insertFeeder = db.prepare(
      'INSERT INTO feeders (id, name, region_id, capacity_kva, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertTransformer = db.prepare(
      `INSERT INTO transformers (
        id, name, feeder_id, region_id, capacity_kva, lat, lng, status,
        current_load_kw, loading_pct, temperature_c, forecast_load_kw,
        risk_level, power_factor, voltage_class, connected_consumers,
        last_telemetry_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const capacities = [100, 250, 500];
    const createdTransformers: Array<{ id: string; name: string; region_id: string; capacity_kva: number }> = [];

    let transformerCounter = 1;
    for (const reg of goaRegionsData) {
      // 2 feeders per region
      for (let f = 1; f <= 2; f++) {
        const feederId = `fdr-${reg.id}-${f}`;
        const feederCapacity = 2000;
        insertFeeder.run(feederId, `${reg.name} Feeder 0${f}`, reg.id, feederCapacity, 'active', now);

        // 3 transformers per feeder
        for (let t = 1; t <= 3; t++) {
          const transId = `tr-${reg.id}-f${f}-${t}`;
          const capacity = capacities[(transformerCounter) % capacities.length];
          // Slight coordinate offsets around region center
          const latOffset = (t * 0.005) - 0.01;
          const lngOffset = (f * 0.006) - 0.008;

          // Initial load around 50-70%
          const baseLoadPct = 55 + (t * 7);
          const currentLoad = (capacity * 0.95 * (baseLoadPct / 100));
          const temp = 38.0 + (t * 4);
          let risk = 'NORMAL';
          let status = 'normal';

          if (baseLoadPct >= 80) {
            risk = 'WARNING';
            status = 'warning';
          } else if (baseLoadPct >= 65) {
            risk = 'WATCH';
          }

          insertTransformer.run(
            transId,
            `DT-${reg.name.substring(0, 3).toUpperCase()}-0${transformerCounter}`,
            feederId,
            reg.id,
            capacity,
            reg.lat + latOffset,
            reg.lng + lngOffset,
            status,
            parseFloat(currentLoad.toFixed(2)),
            parseFloat(baseLoadPct.toFixed(1)),
            parseFloat(temp.toFixed(1)),
            parseFloat((currentLoad * 1.05).toFixed(2)),
            risk,
            0.95,
            '11kV/415V',
            0, // will update after inserting consumers
            now,
            now
          );

          createdTransformers.push({
            id: transId,
            name: `DT-${reg.name.substring(0, 3).toUpperCase()}-0${transformerCounter}`,
            region_id: reg.id,
            capacity_kva: capacity
          });

          transformerCounter++;
        }
      }
    }

    // 5. Users
    const insertUser = db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, discom_id, region_id, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const superHash = bcrypt.hashSync('SuperAdmin@123', 10);
    const discomHash = bcrypt.hashSync('DiscomAdmin@123', 10);
    const operatorHash = bcrypt.hashSync('Operator@123', 10);
    const consumerHash = bcrypt.hashSync('Consumer@123', 10);

    const superUserId = 'user-super-admin';
    const discomUserId = 'user-discom-admin';
    const operatorUserId = 'user-operator-admin';
    const consumerUserId = 'user-consumer-demo';

    insertUser.run(superUserId, 'super@urjasync.demo', superHash, 'Priya Sharma (Super Admin)', 'SUPER_ADMIN', null, null, now, now, 1);
    insertUser.run(discomUserId, 'discom@urjasync.demo', discomHash, 'Rohan Pai (Goa DISCOM Admin)', 'DISCOM_ADMIN', 'discom-ged', null, now, now, 1);
    insertUser.run(operatorUserId, 'operator@urjasync.demo', operatorHash, 'Vikram Naik (Panaji Operator)', 'GRID_OPERATOR', 'discom-ged', 'reg-panaji', now, now, 1);
    insertUser.run(consumerUserId, 'consumer@urjasync.demo', consumerHash, 'Amit Vernekar (Prosumer)', 'CONSUMER', 'discom-ged', 'reg-panaji', now, now, 1);

    // 6. Consumers & Appliances
    const insertConsumer = db.prepare(
      `INSERT INTO consumers (id, user_id, transformer_id, region_id, name, service_connection_no, sanctioned_load_kw, is_flexible, urja_coins, participation_streak, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertAppliance = db.prepare(
      `INSERT INTO appliances (id, consumer_id, name, type, rated_power_kw, is_flexible, is_available, max_interruption_minutes, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Ananya', 'Diya', 'Gauri', 'Kavya', 'Saanvi', 'Anushka', 'Tara', 'Sneha'];
    const lastNames = ['Kamat', 'Deshmukh', 'Shenoy', 'Prabhu', 'Bhandari', 'Sawant', 'Fernandes', 'D\'Souza', 'Rodrigues', 'Rane', 'Patil', 'Chavan', 'Govekar', 'Shirodkar', 'Naik'];

    const applianceTypes = [
      { name: 'Smart Inverter AC 1.5T', type: 'hvac', power: 1.8, maxMin: 45, prio: 2 },
      { name: 'OBC EV Charger 7.4kW', type: 'ev_charger', power: 7.4, maxMin: 120, prio: 1 },
      { name: 'Storage Water Geyser 25L', type: 'water_heater', power: 2.0, maxMin: 60, prio: 3 },
      { name: 'Smart Frost-Free Fridge', type: 'refrigerator', power: 0.35, maxMin: 30, prio: 4 },
      { name: 'Pool Pump / Filtration', type: 'pump', power: 1.5, maxMin: 90, prio: 1 }
    ];

    const transformerConsumerCount: Record<string, number> = {};

    for (let c = 1; c <= 54; c++) {
      const consumerId = `cons-${c.toString().padStart(3, '0')}`;
      const fName = firstNames[c % firstNames.length];
      const lName = lastNames[(c * 3) % lastNames.length];
      const fullName = `${fName} ${lName}`;

      // Pick transformer round-robin among created transformers
      const assignedTrans = createdTransformers[(c - 1) % createdTransformers.length];
      transformerConsumerCount[assignedTrans.id] = (transformerConsumerCount[assignedTrans.id] || 0) + 1;

      // First consumer is linked to the demo consumer user
      const linkedUserId = c === 1 ? consumerUserId : null;
      const sanctionedLoad = [5.0, 7.5, 10.0, 15.0][c % 4];
      const isFlexible = c % 6 === 0 ? 0 : 1; // 85% flexible
      const coins = 120 + (c * 15);
      const streak = (c % 7) + 1;

      insertConsumer.run(
        consumerId,
        linkedUserId,
        assignedTrans.id,
        assignedTrans.region_id,
        fullName,
        `SCN-GOA-${(100000 + c)}`,
        sanctionedLoad,
        isFlexible,
        coins,
        streak,
        now
      );

      // Add 2 to 4 appliances per consumer
      const numAppliances = 2 + (c % 3);
      for (let a = 0; a < numAppliances; a++) {
        const appProto = applianceTypes[(c + a) % applianceTypes.length];
        const appId = `app-${consumerId}-${a + 1}`;
        insertAppliance.run(
          appId,
          consumerId,
          `${fullName}'s ${appProto.name}`,
          appProto.type,
          appProto.power,
          isFlexible,
          1, // available
          appProto.maxMin,
          appProto.prio,
          now
        );
      }
    }

    // Update transformer connected_consumers count
    const updateTransCount = db.prepare('UPDATE transformers SET connected_consumers = ? WHERE id = ?');
    for (const [transId, count] of Object.entries(transformerConsumerCount)) {
      updateTransCount.run(count, transId);
    }

    // 7. Simulation Scenarios
    const insertScenario = db.prepare(
      'INSERT INTO simulation_scenarios (id, name, description, type, config, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const scenarios = [
      {
        id: 'scen-normal-day',
        name: 'Normal Day',
        description: 'Typical weekday load profile with standard residential patterns and average solar output.',
        type: 'baseline',
        config: JSON.stringify({ baseLoadFactor: 1.0, solarFactor: 1.0, evChargingSurge: 1.0, tempOffsetC: 0 })
      },
      {
        id: 'scen-duck-curve',
        name: 'Evening Duck Curve',
        description: 'High daytime solar generation collapsing rapidly between 5 PM and 8 PM as evening residential peaks ramp up.',
        type: 'duck_curve',
        config: JSON.stringify({ baseLoadFactor: 1.15, solarFactor: 1.4, solarDecayRate: 1.8, evChargingSurge: 1.3, tempOffsetC: 1 })
      },
      {
        id: 'scen-heatwave',
        name: 'Extreme Heatwave',
        description: 'Severe 42°C ambient heatwave driving continuous heavy HVAC demand and elevated transformer thermal stress.',
        type: 'heatwave',
        config: JSON.stringify({ baseLoadFactor: 1.35, solarFactor: 1.1, hvacMultiplier: 1.6, tempOffsetC: 7 })
      },
      {
        id: 'scen-solar-drop',
        name: 'Solar Drop',
        description: 'Sudden monsoon cloud cover causing 70% drop in rooftop solar output across coastal feeders within 15 minutes.',
        type: 'solar_drop',
        config: JSON.stringify({ baseLoadFactor: 1.05, solarFactor: 0.25, cloudCoverDropPct: 75, tempOffsetC: -1 })
      },
      {
        id: 'scen-ev-surge',
        name: 'EV Charging Surge',
        description: 'Synchronized return-from-work EV charging between 6:30 PM and 9:00 PM exceeding feeder rating.',
        type: 'ev_surge',
        config: JSON.stringify({ baseLoadFactor: 1.1, evChargingSurge: 2.5, evConcurrencyPct: 85, tempOffsetC: 0 })
      },
      {
        id: 'scen-near-capacity',
        name: 'Transformer Near Capacity',
        description: 'Targeted DT running at 94% continuous loading on Feeder 01, requiring imminent DR curtailment.',
        type: 'near_capacity',
        config: JSON.stringify({ baseLoadFactor: 1.45, targetDTId: 'tr-reg-panaji-f1-1', targetLoadingPct: 94, tempOffsetC: 3 })
      },
      {
        id: 'scen-multi-region-stress',
        name: 'Multi-Region Stress',
        description: 'Coordinated peak demand across Panaji, Margao, and Vasco simultaneously straining transmission interconnection.',
        type: 'multi_region_stress',
        config: JSON.stringify({ baseLoadFactor: 1.3, regions: ['reg-panaji', 'reg-margao', 'reg-vasco'], tempOffsetC: 4 })
      },
      {
        id: 'scen-sensor-failure',
        name: 'Sensor Failure',
        description: 'Intermittent telemetry loss and bad sensor data injection simulating field device telemetry corruption.',
        type: 'sensor_failure',
        config: JSON.stringify({ dropRatePct: 40, injectFaultyReadings: true, targetSensor: 'current' })
      },
      {
        id: 'scen-dr-success',
        name: 'DR Success',
        description: 'Rapid, high-compliance consumer response shedding 45 kW of flexible load within 8 minutes.',
        type: 'dr_success',
        config: JSON.stringify({ participationPct: 92, targetReductionKw: 45, complianceLatencyMin: 5 })
      },
      {
        id: 'scen-dr-failure',
        name: 'DR Failure',
        description: 'Low consumer opt-in and battery reserve depletion leading to breaker trip and feeder outage.',
        type: 'dr_failure',
        config: JSON.stringify({ participationPct: 22, breakerTripTriggerPct: 105, batteryDepleted: true })
      }
    ];

    for (const sc of scenarios) {
      insertScenario.run(sc.id, sc.name, sc.description, sc.type, sc.config, now);
    }

    // 8. Simulation State (Singleton)
    db.prepare(
      `INSERT INTO simulation_state (id, scenario_id, status, speed, sim_time, seed, started_at, created_at)
       VALUES (1, ?, 'paused', 1.0, ?, 42, null, ?)`
    ).run('scen-normal-day', now, now);

    // 9. Reward Policies
    const insertPolicy = db.prepare(
      `INSERT INTO reward_policies (id, name, points_per_kwh, max_points_per_campaign, budget_per_campaign, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    insertPolicy.run('pol-peak-shave', 'Peak Shaving Standard Policy', 15.0, 600, 50000, now);
    insertPolicy.run('pol-emergency-curtail', 'Emergency DR High-Value Policy', 35.0, 1500, 120000, now);
    insertPolicy.run('pol-solar-soak', 'Solar Soak Daytime Incentive', 8.0, 300, 30000, now);

    // 10. Batteries & V2G
    const insertBattery = db.prepare(
      `INSERT INTO batteries (id, name, region_id, capacity_kwh, current_soc_pct, charge_power_kw, discharge_power_kw, efficiency, status, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const b1 = 'bat-panaji-comm-1';
    const b2 = 'bat-margao-v2g-1';
    insertBattery.run(b1, 'Panaji Smart BESS 250kWh', 'reg-panaji', 250.0, 78.5, 60.0, 60.0, 0.94, 'idle', 'community', now);
    insertBattery.run(b2, 'Margao Hub V2G Battery Cluster', 'reg-margao', 180.0, 64.0, 45.0, 45.0, 0.91, 'idle', 'v2g', now);

    const insertV2g = db.prepare(
      `INSERT INTO v2g_resources (id, name, region_id, battery_id, vehicle_type, available, discharge_capacity_kw, soc_pct, reward_cost_per_kwh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    insertV2g.run('v2g-ev-fleet-1', 'Goa Smart Commuter Fleet - Tata Nexon EV (x5)', 'reg-panaji', b1, 'commercial_ev', 1, 35.0, 82.0, 18.0, now);
    insertV2g.run('v2g-ev-bus-1', 'Kadamba Electric Feeder Bus #12', 'reg-margao', b2, 'electric_bus', 1, 50.0, 71.0, 16.5, now);

    // 11. Initial Telemetry & Predictions for each Transformer
    const insertTelemetry = db.prepare(
      `INSERT INTO telemetry_readings (id, transformer_id, device_id, sensor_type, value, unit, quality, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertPrediction = db.prepare(
      `INSERT INTO prediction_results (id, transformer_id, predicted_load_kw, predicted_loading_pct, risk_level, risk_score, confidence, prediction_source, forecast_horizon_min, explanation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const tr of createdTransformers) {
      const loadKw = (tr.capacity_kva * 0.95 * 0.62);
      const tempC = 41.5;

      insertTelemetry.run(uuidv4(), tr.id, `IOT-${tr.name}`, 'active_power_kw', parseFloat(loadKw.toFixed(2)), 'kW', 'good', now);
      insertTelemetry.run(uuidv4(), tr.id, `IOT-${tr.name}`, 'top_oil_temp_c', tempC, '°C', 'good', now);
      insertTelemetry.run(uuidv4(), tr.id, `IOT-${tr.name}`, 'voltage_v', 412.5, 'V', 'good', now);

      insertPrediction.run(
        uuidv4(),
        tr.id,
        parseFloat((loadKw * 1.08).toFixed(2)),
        parseFloat(((loadKw * 1.08) / (tr.capacity_kva * 0.95) * 100).toFixed(1)),
        'WATCH',
        0.67,
        0.91,
        'rule-based-demo',
        15,
        'Projected evening residential peak combined with ambient temperature rise.',
        now
      );
    }

    // 12. Sample Demand Response Campaign & Transactions
    const campId = 'camp-panaji-peak-01';
    const campTrans = createdTransformers[0];
    db.prepare(
      `INSERT INTO demand_response_campaigns (
        id, transformer_id, region_id, status, target_reduction_kw,
        achieved_reduction_kw, estimated_reward_cost, actual_reward_cost,
        reason, created_by, approved_by, created_at, approved_at, started_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      campId,
      campTrans.id,
      campTrans.region_id,
      'completed',
      25.0,
      27.2,
      400.0,
      415.0,
      'Relieve Feeder 01 evening overload spike above 90% threshold',
      operatorUserId,
      operatorUserId,
      new Date(Date.now() - 3600000 * 2).toISOString(),
      new Date(Date.now() - 3600000 * 2 + 60000).toISOString(),
      new Date(Date.now() - 3600000 * 2 + 120000).toISOString(),
      new Date(Date.now() - 3600000).toISOString()
    );

    // Link demo consumer to this completed campaign
    const campConsumerId = uuidv4();
    db.prepare(
      `INSERT INTO campaign_consumers (id, campaign_id, consumer_id, appliance_id, flexible_load_kw, reward_offered, status, selected_by_optimizer, responded_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      campConsumerId,
      campId,
      'cons-001',
      'app-cons-001-1',
      7.4,
      110.0,
      'completed',
      1,
      new Date(Date.now() - 3600000 * 2 + 180000).toISOString(),
      new Date(Date.now() - 3600000 * 2).toISOString()
    );

    db.prepare(
      `INSERT INTO reward_transactions (id, consumer_id, campaign_id, transformer_id, region_id, points, status, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      `tx-${uuidv4().substring(0, 8)}`,
      'cons-001',
      campId,
      campTrans.id,
      campTrans.region_id,
      110,
      'confirmed',
      'Completed EV Charger curtailment during peak shaving campaign',
      new Date(Date.now() - 3600000).toISOString()
    );

    // 13. System Settings
    const insertSetting = db.prepare(
      'INSERT INTO system_settings (key, value, updated_at) VALUES (?, ?, ?)'
    );
    insertSetting.run('alert_loading_threshold_pct', '80', now);
    insertSetting.run('critical_loading_threshold_pct', '92', now);
    insertSetting.run('telemetry_interval_sec', '5', now);
    insertSetting.run('dr_auto_approval', 'false', now);
    insertSetting.run('sim_default_speed', '1', now);
    insertSetting.run('grid_frequency_target_hz', '50.00', now);
    insertSetting.run('curtailment_default_rate_rs_per_kwh', '12.50', now);

    // 14. Sample Notifications
    const insertNotification = db.prepare(
      `INSERT INTO notifications (id, user_id, title, message, type, read, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    insertNotification.run(
      uuidv4(),
      operatorUserId,
      'High Loading Warning',
      `Transformer ${campTrans.name} exceeded 85% loading limit during peak window.`,
      'warning',
      0,
      'transformer',
      campTrans.id,
      now
    );

    insertNotification.run(
      uuidv4(),
      consumerUserId,
      'Demand Response Reward Received',
      'You earned 110 Urja Coins for participating in the evening peak curtailment!',
      'success',
      0,
      'reward',
      campId,
      now
    );

    // 15. Sample Audit Log
    db.prepare(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, prev_value, new_value, result, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      uuidv4(),
      operatorUserId,
      'APPROVE_CAMPAIGN',
      'demand_response_campaigns',
      campId,
      'pending_approval',
      'approved',
      'SUCCESS',
      '127.0.0.1',
      now
    );

    console.log(`Seeded successfully:`);
    console.log(`- 1 Organization, 5 DISCOMs`);
    console.log(`- ${goaRegionsData.length} Regions`);
    console.log(`- ${goaRegionsData.length * 2} Feeders`);
    console.log(`- ${createdTransformers.length} Transformers`);
    console.log(`- 54 Consumers with connected appliances`);
    console.log(`- 4 Demo Users (Super, Discom, Operator, Consumer)`);
    console.log(`- 10 Simulation Scenarios`);
    console.log(`- System settings, policies, batteries, telemetry, campaigns, and notifications.`);
  });

  seedTx();
}

// Execute directly if run as a script
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to seed database:', err);
      process.exit(1);
    });
}
