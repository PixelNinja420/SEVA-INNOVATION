export type UserRole = 'SUPER_ADMIN' | 'DISCOM_ADMIN' | 'GRID_OPERATOR' | 'CONSUMER';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  discom_id?: string | null;
  region_id?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  discom_id: string | null;
  region_id: string | null;
  created_at: string;
  updated_at: string;
  is_active: number;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  created_at: string;
}

export interface DiscomRecord {
  id: string;
  name: string;
  organization_id: string | null;
  state: string;
  created_at: string;
}

export interface RegionRecord {
  id: string;
  name: string;
  discom_id: string;
  state: string;
  parent_region_id: string | null;
  level: 'zone' | 'circle' | 'division' | 'subdivision';
  lat: number;
  lng: number;
  created_at: string;
}

export interface FeederRecord {
  id: string;
  name: string;
  region_id: string;
  capacity_kva: number;
  status: string;
  created_at: string;
}

export interface TransformerRecord {
  id: string;
  name: string;
  feeder_id: string;
  region_id: string;
  capacity_kva: number;
  lat: number;
  lng: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  current_load_kw: number;
  loading_pct: number;
  temperature_c: number;
  forecast_load_kw: number;
  risk_level: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'DATA_UNAVAILABLE';
  power_factor: number;
  voltage_class: string;
  connected_consumers: number;
  last_telemetry_at: string | null;
  created_at: string;
}

export interface ConsumerRecord {
  id: string;
  user_id: string | null;
  transformer_id: string;
  region_id: string;
  name: string;
  service_connection_no: string;
  sanctioned_load_kw: number;
  is_flexible: number;
  urja_coins: number;
  participation_streak: number;
  created_at: string;
}

export interface ApplianceRecord {
  id: string;
  consumer_id: string;
  name: string;
  type: string;
  rated_power_kw: number;
  is_flexible: number;
  is_available: number;
  max_interruption_minutes: number;
  priority: number;
  created_at: string;
}

export interface CampaignRecord {
  id: string;
  transformer_id: string;
  region_id: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled';
  target_reduction_kw: number;
  achieved_reduction_kw: number;
  estimated_reward_cost: number;
  actual_reward_cost: number;
  reason: string;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface CampaignConsumerRecord {
  id: string;
  campaign_id: string;
  consumer_id: string;
  appliance_id: string | null;
  flexible_load_kw: number;
  reward_offered: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';
  selected_by_optimizer: number;
  responded_at: string | null;
  created_at: string;
}

export interface RewardTransactionRecord {
  id: string;
  consumer_id: string;
  campaign_id: string | null;
  transformer_id: string | null;
  region_id: string | null;
  points: number;
  status: 'pending' | 'confirmed' | 'reversed';
  reason: string;
  created_at: string;
}

export interface KnapsackItem {
  id: string;
  consumerId: string;
  applianceId?: string;
  flexibleLoadKw: number;
  rewardCost: number;
  priority?: number;
  consumerName?: string;
  applianceName?: string;
}

export interface KnapsackResult {
  selectedItems: KnapsackItem[];
  totalReductionKw: number;
  totalCost: number;
  targetReductionKw: number;
  isFeasible: boolean;
  efficiencyRatio: number; // cost per kW
}

export interface PredictionInput {
  transformerId: string;
  capacityKva: number;
  currentLoadKw: number;
  temperatureC: number;
  powerFactor: number;
  hour: number;
  loadHistoryKw?: number[];
  recentTrendRate?: number;
}

export interface PredictionOutput {
  transformerId: string;
  predictedLoadKw: number;
  predictedLoadingPct: number;
  riskLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'DATA_UNAVAILABLE';
  riskScore: number;
  confidence: number;
  predictionSource: string;
  forecastHorizonMin: number;
  explanation: string;
}
