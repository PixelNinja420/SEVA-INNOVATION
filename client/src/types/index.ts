// User Roles & Authentication
export type UserRole = 'SUPER_ADMIN' | 'DISCOM_ADMIN' | 'GRID_OPERATOR' | 'FIELD_ENGINEER' | 'CONSUMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  regionId?: string;
  discomId?: string;
  avatar?: string;
  coins?: number;
  meterId?: string;
}

// Grid Hierarchy: Discom, Region, Feeder
export interface Discom {
  id: string;
  name: string;
  code: string;
  state: string;
  headquarters: string;
  transformersCount: number;
  feedersCount: number;
  consumersCount: number;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  discomId: string;
  centerCoordinates: [number, number];
  zoomLevel: number;
  transformersCount: number;
  totalCapacityKVA: number;
  currentLoadKW: number;
}

export interface Feeder {
  id: string;
  name: string;
  code: string;
  substationName: string;
  regionId: string;
  voltageKV: number;
  peakCapacityKW: number;
  transformersCount: number;
}

// Transformer Types
export type TransformerStatus = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Transformer {
  id: string;
  name: string;
  code: string;
  regionId: string;
  regionName: string;
  feederId: string;
  feederName: string;
  coordinates: [number, number];
  capacityKVA: number;
  currentLoadKW: number;
  loadingPercentage: number;
  oilTemperature: number; // Celsius
  windingTemperature: number; // Celsius
  ambientTemperature: number; // Celsius
  status: TransformerStatus;
  riskLevel: RiskLevel;
  healthIndex: number; // 0-100
  connectedConsumersCount: number;
  lastTelemetryTimestamp: string;
  installationYear: number;
  makeModel: string;
  lastServicedDate: string;
  isOverloaded: boolean;
}

// Consumer & Appliance Types
export interface Appliance {
  id: string;
  name: string;
  type: 'EV_CHARGER' | 'WATER_HEATER' | 'AIR_CONDITIONER' | 'WATER_PUMP' | 'BATTERY_STORAGE' | 'OTHER';
  ratedPowerKW: number;
  isFlexible: boolean;
  canInterrupt: boolean;
  minOffMinutes?: number;
  currentStatus: 'IDLE' | 'ACTIVE' | 'SHED_PAUSED';
}

export interface Consumer {
  id: string;
  consumerNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  transformerId: string;
  transformerName: string;
  feederId: string;
  meterId: string;
  contractDemandKW: number;
  currentLoadKW: number;
  coinsBalance: number;
  optInStatus: boolean;
  appliances: Appliance[];
  riskTier?: 'BRONZE' | 'SILVER' | 'GOLD';
}

// Telemetry & Real-Time Data
export interface TelemetryReading {
  id: string;
  transformerId: string;
  timestamp: string;
  loadKW: number;
  voltageV: number;
  currentA: number;
  oilTempC: number;
  windingTempC: number;
  ambientTempC: number;
  powerFactor: number;
  harmonicDistortion: number;
  solarGenerationKW?: number;
}

// Prediction Result (LightGBM Dual Engine)
export interface PredictionResult {
  id: string;
  transformerId: string;
  transformerName: string;
  timestamp: string;
  horizonMinutes: number; // e.g. 15, 30, 60
  forecastLoadKW: number;
  forecastLoadingPercentage: number;
  predictedRiskLevel: RiskLevel;
  overloadProbability: number;
  confidenceScore: number;
  modelName: string;
  modelVersion: string;
  source: 'lightgbm' | 'rule-based-demo';
  explanationFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
}

// Optimization (0/1 Knapsack Dual Engine)
export interface KnapsackItem {
  consumerId: string;
  consumerName: string;
  consumerNumber: string;
  applianceId: string;
  applianceName: string;
  applianceType: string;
  flexibleLoadKW: number;
  rewardCostCoins: number;
  ratioKWPerCoin: number;
  selected: boolean;
  priorityScore: number;
  reason?: string;
}

export interface OptimizationResult {
  id: string;
  transformerId: string;
  transformerName: string;
  timestamp: string;
  targetReductionKW: number;
  achievedReductionKW: number;
  totalRewardCostCoins: number;
  selectedConsumersCount: number;
  totalCandidatesCount: number;
  solverType: '0/1 Knapsack DP' | 'Greedy Approximation';
  executionTimeMs: number;
  isInfeasible: boolean;
  items: KnapsackItem[];
}

// Demand Response Campaign
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface CampaignConsumer {
  consumerId: string;
  consumerName: string;
  consumerNumber: string;
  applianceName: string;
  requestedReductionKW: number;
  rewardOfferedCoins: number;
  responseStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'VERIFIED' | 'COMPLETED';
  respondedAt?: string;
  verifiedReductionKW?: number;
}

export interface Campaign {
  id: string;
  title: string;
  code: string;
  transformerId: string;
  transformerName: string;
  feederName: string;
  targetReductionKW: number;
  achievedReductionKW: number;
  targetDurationMinutes: number;
  status: CampaignStatus;
  startTime: string;
  endTime?: string;
  createdAt: string;
  dispatchedBy: string;
  consumers: CampaignConsumer[];
  totalCoinsAllocated: number;
}

// Urja Coins Rewards
export interface RewardTransaction {
  id: string;
  consumerId: string;
  consumerName?: string;
  amount: number;
  type: 'EARNED_DR' | 'EARNED_SOLAR' | 'REDEEMED_DISCOUNT' | 'BONUS_STREAK';
  description: string;
  timestamp: string;
  campaignId?: string;
  campaignTitle?: string;
  status: 'COMPLETED' | 'PENDING';
}

// Battery & V2G
export interface Battery {
  id: string;
  name: string;
  type: 'BESS_COMMUNITY' | 'V2G_FLEET' | 'SUBSTATION_STORAGE';
  transformerId: string;
  transformerName: string;
  capacityKWh: number;
  currentSoCPercent: number; // State of Charge
  maxDischargeRateKW: number;
  currentOutputKW: number; // Positive = discharging, Negative = charging
  healthPercentage: number;
  status: 'DISCHARGING' | 'CHARGING' | 'STANDBY' | 'MAINTENANCE';
  evCountConnected?: number;
}

export interface V2GResource {
  id: string;
  vehicleModel: string;
  ownerName: string;
  batteryCapacityKWh: number;
  currentSoCPercent: number;
  minReservedSoCPercent: number;
  availableFlexKW: number;
  status: 'CONNECTED' | 'DISCHARGING' | 'IDLE';
  transformerId: string;
}

// Simulation Lab
export type SimulationScenario = 'NORMAL' | 'EVENING_PEAK' | 'SOLAR_DROP' | 'HEATWAVE' | 'EV_SURGE' | 'EXTREME_STRESS';

export interface SimulationState {
  simulatedTime: string; // ISO string or '18:45:00'
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  speed: 1 | 2 | 5 | 10;
  scenario: SimulationScenario;
  ambientTemperatureC: number;
  solarRadiationPct: number;
  gridFrequencyHz: number;
  stepCount: number;
}

export interface SimulationEvent {
  id: string;
  timestamp: string;
  type: 'PEAK_INJECT' | 'SOLAR_DROP' | 'EV_SURGE' | 'HVAC_SPIKE' | 'SENSOR_FAILURE' | 'CAMPAIGN_TRIGGERED' | 'LOAD_NORMALIZED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  message: string;
  transformerId?: string;
}

// Notifications & Audits
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'CRITICAL_ALERT' | 'PREDICTION_WARNING' | 'CAMPAIGN_UPDATE' | 'REWARD_EARNED' | 'SYSTEM_INFO';
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'TRANSFORMER' | 'CAMPAIGN' | 'SIMULATION' | 'USER' | 'SYSTEM_CONFIG';
  resourceId?: string;
  details: string;
  ipAddress: string;
}

// Analytics
export interface AnalyticsData {
  timeframe: string;
  peakDemandKW: number;
  averageLoadingPct: number;
  avoidedFailuresCount: number;
  drEventsExecuted: number;
  totalCoinsDistributed: number;
  co2SavedKg: number;
  substationMetrics: {
    name: string;
    transformersCount: number;
    avgLoading: number;
    overloadHours: number;
  }[];
}
