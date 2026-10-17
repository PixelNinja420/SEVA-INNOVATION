-- Urja-Sync SQLite Database Schema
PRAGMA foreign_keys = ON;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. DISCOMs
CREATE TABLE IF NOT EXISTS discoms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    state TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 3. Regions (Hierarchy: Zone -> Circle -> Division -> Subdivision)
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discom_id TEXT NOT NULL REFERENCES discoms(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    parent_region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
    level TEXT NOT NULL CHECK(level IN ('zone', 'circle', 'division', 'subdivision')),
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at TEXT NOT NULL
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'DISCOM_ADMIN', 'GRID_OPERATOR', 'CONSUMER')),
    discom_id TEXT REFERENCES discoms(id) ON DELETE SET NULL,
    region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 5. Feeders
CREATE TABLE IF NOT EXISTS feeders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    capacity_kva REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
);

-- 6. Transformers
CREATE TABLE IF NOT EXISTS transformers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    feeder_id TEXT NOT NULL REFERENCES feeders(id) ON DELETE CASCADE,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    capacity_kva REAL NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('normal', 'warning', 'critical', 'offline')),
    current_load_kw REAL NOT NULL DEFAULT 0,
    loading_pct REAL NOT NULL DEFAULT 0,
    temperature_c REAL NOT NULL DEFAULT 35.0,
    forecast_load_kw REAL NOT NULL DEFAULT 0,
    risk_level TEXT NOT NULL CHECK(risk_level IN ('NORMAL', 'WATCH', 'WARNING', 'CRITICAL', 'DATA_UNAVAILABLE')),
    power_factor REAL NOT NULL DEFAULT 0.95,
    voltage_class TEXT NOT NULL DEFAULT '11kV/415V',
    connected_consumers INTEGER NOT NULL DEFAULT 0,
    last_telemetry_at TEXT,
    created_at TEXT NOT NULL
);

-- 7. Consumers
CREATE TABLE IF NOT EXISTS consumers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    transformer_id TEXT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_connection_no TEXT UNIQUE NOT NULL,
    sanctioned_load_kw REAL NOT NULL,
    is_flexible INTEGER NOT NULL DEFAULT 1,
    urja_coins INTEGER NOT NULL DEFAULT 0,
    participation_streak INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

-- 8. Appliances
CREATE TABLE IF NOT EXISTS appliances (
    id TEXT PRIMARY KEY,
    consumer_id TEXT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rated_power_kw REAL NOT NULL,
    is_flexible INTEGER NOT NULL DEFAULT 1,
    is_available INTEGER NOT NULL DEFAULT 1,
    max_interruption_minutes INTEGER NOT NULL DEFAULT 60,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 9. Telemetry Readings
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id TEXT PRIMARY KEY,
    transformer_id TEXT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    quality TEXT NOT NULL CHECK(quality IN ('good', 'estimated', 'bad', 'interpolated')),
    timestamp TEXT NOT NULL
);

-- 10. Prediction Results
CREATE TABLE IF NOT EXISTS prediction_results (
    id TEXT PRIMARY KEY,
    transformer_id TEXT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    predicted_load_kw REAL NOT NULL,
    predicted_loading_pct REAL NOT NULL,
    risk_level TEXT NOT NULL CHECK(risk_level IN ('NORMAL', 'WATCH', 'WARNING', 'CRITICAL', 'DATA_UNAVAILABLE')),
    risk_score REAL NOT NULL,
    confidence REAL NOT NULL,
    prediction_source TEXT NOT NULL,
    forecast_horizon_min INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 11. Simulation Scenarios
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    config TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 12. Simulation State (Singleton)
CREATE TABLE IF NOT EXISTS simulation_state (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    scenario_id TEXT REFERENCES simulation_scenarios(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK(status IN ('stopped', 'running', 'paused')),
    speed REAL NOT NULL DEFAULT 1,
    sim_time TEXT NOT NULL,
    seed INTEGER NOT NULL DEFAULT 42,
    started_at TEXT,
    created_at TEXT NOT NULL
);

-- 13. Demand Response Campaigns
CREATE TABLE IF NOT EXISTS demand_response_campaigns (
    id TEXT PRIMARY KEY,
    transformer_id TEXT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK(status IN ('draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled')),
    target_reduction_kw REAL NOT NULL,
    achieved_reduction_kw REAL NOT NULL DEFAULT 0,
    estimated_reward_cost REAL NOT NULL DEFAULT 0,
    actual_reward_cost REAL NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    approved_at TEXT,
    started_at TEXT,
    completed_at TEXT
);

-- 14. Campaign Consumers
CREATE TABLE IF NOT EXISTS campaign_consumers (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES demand_response_campaigns(id) ON DELETE CASCADE,
    consumer_id TEXT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    appliance_id TEXT REFERENCES appliances(id) ON DELETE SET NULL,
    flexible_load_kw REAL NOT NULL,
    reward_offered REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'completed', 'expired')),
    selected_by_optimizer INTEGER NOT NULL DEFAULT 1,
    responded_at TEXT,
    created_at TEXT NOT NULL
);

-- 15. Reward Transactions
CREATE TABLE IF NOT EXISTS reward_transactions (
    id TEXT PRIMARY KEY,
    consumer_id TEXT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES demand_response_campaigns(id) ON DELETE SET NULL,
    transformer_id TEXT REFERENCES transformers(id) ON DELETE SET NULL,
    region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'reversed')),
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 16. Reward Policies
CREATE TABLE IF NOT EXISTS reward_policies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    points_per_kwh REAL NOT NULL,
    max_points_per_campaign INTEGER NOT NULL,
    budget_per_campaign REAL NOT NULL,
    created_at TEXT NOT NULL
);

-- 17. Batteries
CREATE TABLE IF NOT EXISTS batteries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    capacity_kwh REAL NOT NULL,
    current_soc_pct REAL NOT NULL,
    charge_power_kw REAL NOT NULL,
    discharge_power_kw REAL NOT NULL,
    efficiency REAL NOT NULL DEFAULT 0.92,
    status TEXT NOT NULL CHECK(status IN ('idle', 'charging', 'discharging', 'maintenance', 'offline')),
    type TEXT NOT NULL CHECK(type IN ('community', 'v2g')),
    created_at TEXT NOT NULL
);

-- 18. V2G Resources
CREATE TABLE IF NOT EXISTS v2g_resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    battery_id TEXT REFERENCES batteries(id) ON DELETE SET NULL,
    vehicle_type TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 1,
    discharge_capacity_kw REAL NOT NULL,
    soc_pct REAL NOT NULL,
    reward_cost_per_kwh REAL NOT NULL,
    created_at TEXT NOT NULL
);

-- 19. Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id TEXT PRIMARY KEY,
    transformer_id TEXT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    completed_at TEXT,
    created_at TEXT NOT NULL
);

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    entity_type TEXT,
    entity_id TEXT,
    created_at TEXT NOT NULL
);

-- 21. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    prev_value TEXT,
    new_value TEXT,
    result TEXT NOT NULL DEFAULT 'SUCCESS',
    ip_address TEXT,
    created_at TEXT NOT NULL
);

-- 22. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region_id);
CREATE INDEX IF NOT EXISTS idx_regions_discom ON regions(discom_id);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_region_id);
CREATE INDEX IF NOT EXISTS idx_feeders_region ON feeders(region_id);
CREATE INDEX IF NOT EXISTS idx_transformers_feeder ON transformers(feeder_id);
CREATE INDEX IF NOT EXISTS idx_transformers_region ON transformers(region_id);
CREATE INDEX IF NOT EXISTS idx_transformers_status ON transformers(status);
CREATE INDEX IF NOT EXISTS idx_transformers_risk ON transformers(risk_level);
CREATE INDEX IF NOT EXISTS idx_consumers_transformer ON consumers(transformer_id);
CREATE INDEX IF NOT EXISTS idx_consumers_region ON consumers(region_id);
CREATE INDEX IF NOT EXISTS idx_consumers_user ON consumers(user_id);
CREATE INDEX IF NOT EXISTS idx_appliances_consumer ON appliances(consumer_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_transformer_ts ON telemetry_readings(transformer_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_sensor ON telemetry_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_predictions_transformer ON prediction_results(transformer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_transformer ON demand_response_campaigns(transformer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON demand_response_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_consumers_campaign ON campaign_consumers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_consumers_consumer ON campaign_consumers(consumer_id);
CREATE INDEX IF NOT EXISTS idx_reward_tx_consumer ON reward_transactions(consumer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
