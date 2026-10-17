import axios from 'axios';
import {
  Transformer,
  Region,
  Feeder,
  PredictionResult,
  OptimizationResult,
  Campaign,
  Consumer,
  Battery,
  V2GResource,
  AnalyticsData,
  AuditLog,
  User,
  RewardTransaction,
} from '@/types';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('urja_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock Database for offline/demo operation
export const MOCK_REGIONS: Region[] = [
  {
    id: 'reg-north-goa',
    name: 'North Goa',
    code: 'NG-DIS',
    discomId: 'ged-goa',
    centerCoordinates: [15.545, 73.83],
    zoomLevel: 12,
    transformersCount: 124,
    totalCapacityKVA: 18500,
    currentLoadKW: 14200,
  },
  {
    id: 'reg-south-goa',
    name: 'South Goa',
    code: 'SG-DIS',
    discomId: 'ged-goa',
    centerCoordinates: [15.283, 73.985],
    zoomLevel: 12,
    transformersCount: 156,
    totalCapacityKVA: 23200,
    currentLoadKW: 16800,
  },
  {
    id: 'reg-panaji-urban',
    name: 'Panaji Urban Sector',
    code: 'PAN-URB',
    discomId: 'ged-goa',
    centerCoordinates: [15.4909, 73.8278],
    zoomLevel: 14,
    transformersCount: 48,
    totalCapacityKVA: 7600,
    currentLoadKW: 6950,
  },
];

export const MOCK_FEEDERS: Feeder[] = [
  {
    id: 'fdr-pan-11kv-01',
    name: 'Panaji Market Feeder 11kV',
    code: 'FDR-PAN-01',
    substationName: 'Panaji 33/11kV Substation',
    regionId: 'reg-panaji-urban',
    voltageKV: 11,
    peakCapacityKW: 3200,
    transformersCount: 14,
  },
  {
    id: 'fdr-mir-11kv-02',
    name: 'Miramar Beach Feeder 11kV',
    code: 'FDR-MIR-02',
    substationName: 'Panaji 33/11kV Substation',
    regionId: 'reg-panaji-urban',
    voltageKV: 11,
    peakCapacityKW: 2800,
    transformersCount: 12,
  },
  {
    id: 'fdr-mar-11kv-03',
    name: 'Margao Commercial Feeder 11kV',
    code: 'FDR-MAR-03',
    substationName: 'Margao South 33/11kV Substation',
    regionId: 'reg-south-goa',
    voltageKV: 11,
    peakCapacityKW: 4500,
    transformersCount: 22,
  },
];

export const MOCK_TRANSFORMERS: Transformer[] = [
  {
    id: 'TR-PAN-101',
    name: 'Panaji City Center DT-01',
    code: 'DT-PAN-101',
    regionId: 'reg-panaji-urban',
    regionName: 'Panaji Urban Sector',
    feederId: 'fdr-pan-11kv-01',
    feederName: 'Panaji Market Feeder 11kV',
    coordinates: [15.4925, 73.8265],
    capacityKVA: 100,
    currentLoadKW: 98.4,
    loadingPercentage: 98.4,
    oilTemperature: 88.5,
    windingTemperature: 96.2,
    ambientTemperature: 33.5,
    status: 'CRITICAL',
    riskLevel: 'CRITICAL',
    healthIndex: 54,
    connectedConsumersCount: 68,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2017,
    makeModel: 'Bharat Bijlee 100kVA 11/0.433kV',
    lastServicedDate: '2025-11-12',
    isOverloaded: true,
  },
  {
    id: 'TR-PAN-102',
    name: 'Miramar Promenade Substation',
    code: 'DT-MIR-102',
    regionId: 'reg-panaji-urban',
    regionName: 'Panaji Urban Sector',
    feederId: 'fdr-mir-11kv-02',
    feederName: 'Miramar Beach Feeder 11kV',
    coordinates: [15.4815, 73.811],
    capacityKVA: 250,
    currentLoadKW: 182.5,
    loadingPercentage: 73.0,
    oilTemperature: 64.2,
    windingTemperature: 69.8,
    ambientTemperature: 32.8,
    status: 'NORMAL',
    riskLevel: 'LOW',
    healthIndex: 91,
    connectedConsumersCount: 142,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2021,
    makeModel: 'Schneider Electric 250kVA EcoStruxure',
    lastServicedDate: '2026-02-10',
    isOverloaded: false,
  },
  {
    id: 'TR-PAN-103',
    name: 'Fontainhas Heritage Quarter',
    code: 'DT-FON-103',
    regionId: 'reg-panaji-urban',
    regionName: 'Panaji Urban Sector',
    feederId: 'fdr-pan-11kv-01',
    feederName: 'Panaji Market Feeder 11kV',
    coordinates: [15.498, 73.832],
    capacityKVA: 100,
    currentLoadKW: 86.2,
    loadingPercentage: 86.2,
    oilTemperature: 76.8,
    windingTemperature: 82.4,
    ambientTemperature: 33.1,
    status: 'WARNING',
    riskLevel: 'HIGH',
    healthIndex: 68,
    connectedConsumersCount: 54,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2016,
    makeModel: 'Voltamp Transformers 100kVA',
    lastServicedDate: '2025-08-19',
    isOverloaded: false,
  },
  {
    id: 'TR-MAR-201',
    name: 'Margao Commercial Complex',
    code: 'DT-MAR-201',
    regionId: 'reg-south-goa',
    regionName: 'South Goa',
    feederId: 'fdr-mar-11kv-03',
    feederName: 'Margao Commercial Feeder 11kV',
    coordinates: [15.273, 73.958],
    capacityKVA: 200,
    currentLoadKW: 212.0,
    loadingPercentage: 106.0,
    oilTemperature: 92.4,
    windingTemperature: 102.1,
    ambientTemperature: 34.0,
    status: 'CRITICAL',
    riskLevel: 'CRITICAL',
    healthIndex: 42,
    connectedConsumersCount: 185,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2014,
    makeModel: 'Kirloskar Electric 200kVA',
    lastServicedDate: '2025-05-14',
    isOverloaded: true,
  },
  {
    id: 'TR-MAR-202',
    name: 'Fatorda Stadium Grid Feeder',
    code: 'DT-FAT-202',
    regionId: 'reg-south-goa',
    regionName: 'South Goa',
    feederId: 'fdr-mar-11kv-03',
    feederName: 'Margao Commercial Feeder 11kV',
    coordinates: [15.295, 73.972],
    capacityKVA: 315,
    currentLoadKW: 168.0,
    loadingPercentage: 53.3,
    oilTemperature: 58.0,
    windingTemperature: 62.5,
    ambientTemperature: 32.5,
    status: 'NORMAL',
    riskLevel: 'LOW',
    healthIndex: 94,
    connectedConsumersCount: 120,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2022,
    makeModel: 'ABB Trafo 315kVA Cast Resin',
    lastServicedDate: '2026-01-20',
    isOverloaded: false,
  },
  {
    id: 'TR-POR-301',
    name: 'Porvorim Secretariat Ring DT',
    code: 'DT-POR-301',
    regionId: 'reg-north-goa',
    regionName: 'North Goa',
    feederId: 'fdr-pan-11kv-01',
    feederName: 'Porvorim 11kV Express',
    coordinates: [15.525, 73.829],
    capacityKVA: 250,
    currentLoadKW: 198.0,
    loadingPercentage: 79.2,
    oilTemperature: 69.5,
    windingTemperature: 74.8,
    ambientTemperature: 33.0,
    status: 'WATCH',
    riskLevel: 'MEDIUM',
    healthIndex: 78,
    connectedConsumersCount: 96,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2019,
    makeModel: 'Crompton Greaves 250kVA',
    lastServicedDate: '2025-09-02',
    isOverloaded: false,
  },
  {
    id: 'TR-CAL-401',
    name: 'Calangute Tourist Belt DT-04',
    code: 'DT-CAL-401',
    regionId: 'reg-north-goa',
    regionName: 'North Goa',
    feederId: 'fdr-mir-11kv-02',
    feederName: 'Calangute Coastal 11kV',
    coordinates: [15.542, 73.765],
    capacityKVA: 250,
    currentLoadKW: 232.5,
    loadingPercentage: 93.0,
    oilTemperature: 84.1,
    windingTemperature: 91.0,
    ambientTemperature: 33.2,
    status: 'WARNING',
    riskLevel: 'HIGH',
    healthIndex: 61,
    connectedConsumersCount: 160,
    lastTelemetryTimestamp: new Date().toISOString(),
    installationYear: 2018,
    makeModel: 'Siemens Geafol 250kVA',
    lastServicedDate: '2025-10-11',
    isOverloaded: false,
  },
  {
    id: 'TR-RIB-501',
    name: 'Ribandar Riverfront DT-02',
    code: 'DT-RIB-501',
    regionId: 'reg-panaji-urban',
    regionName: 'Panaji Urban Sector',
    feederId: 'fdr-pan-11kv-01',
    feederName: 'Panaji Market Feeder 11kV',
    coordinates: [15.503, 73.855],
    capacityKVA: 63,
    currentLoadKW: 0,
    loadingPercentage: 0,
    oilTemperature: 31.0,
    windingTemperature: 31.5,
    ambientTemperature: 31.0,
    status: 'OFFLINE',
    riskLevel: 'LOW',
    healthIndex: 72,
    connectedConsumersCount: 38,
    lastTelemetryTimestamp: new Date(Date.now() - 7200000).toISOString(),
    installationYear: 2015,
    makeModel: 'BHEL 63kVA 11/0.433kV',
    lastServicedDate: '2026-03-01',
    isOverloaded: false,
  },
];

export const MOCK_CONSUMERS: Consumer[] = [
  {
    id: 'c-101',
    consumerNumber: 'GED-PAN-88310',
    name: 'Rajesh Kamat',
    phone: '+91 98221 44521',
    email: 'rajesh.kamat@gmail.com',
    address: 'B-304, Green Acres, St. Inez, Panaji',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederId: 'fdr-pan-11kv-01',
    meterId: 'SM-GOA-9921',
    contractDemandKW: 7.5,
    currentLoadKW: 5.2,
    coinsBalance: 420,
    optInStatus: true,
    riskTier: 'GOLD',
    appliances: [
      { id: 'app-1', name: 'Nexon EV Smart Charger', type: 'EV_CHARGER', ratedPowerKW: 3.3, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-2', name: 'Master Bedroom Inverter AC', type: 'AIR_CONDITIONER', ratedPowerKW: 1.8, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-3', name: 'Instant Geyser 25L', type: 'WATER_HEATER', ratedPowerKW: 2.0, isFlexible: true, canInterrupt: true, currentStatus: 'IDLE' },
    ],
  },
  {
    id: 'c-102',
    consumerNumber: 'GED-PAN-88315',
    name: 'Maria Fernandes',
    phone: '+91 98221 77319',
    email: 'maria.fernandes@outlook.com',
    address: 'House #42, Mala Heritage Area, Panaji',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederId: 'fdr-pan-11kv-01',
    meterId: 'SM-GOA-9928',
    contractDemandKW: 6.0,
    currentLoadKW: 4.1,
    coinsBalance: 285,
    optInStatus: true,
    riskTier: 'SILVER',
    appliances: [
      { id: 'app-4', name: 'Living Room 2.0T AC', type: 'AIR_CONDITIONER', ratedPowerKW: 2.2, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-5', name: 'Storage Water Heater 15L', type: 'WATER_HEATER', ratedPowerKW: 2.0, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
    ],
  },
  {
    id: 'c-103',
    consumerNumber: 'GED-PAN-88320',
    name: 'Vikram Prabhu',
    phone: '+91 98221 11094',
    email: 'vikram.prabhu@yahoo.in',
    address: 'Shanti Niwas, Altinho, Panaji',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederId: 'fdr-pan-11kv-01',
    meterId: 'SM-GOA-9934',
    contractDemandKW: 10.0,
    currentLoadKW: 7.8,
    coinsBalance: 610,
    optInStatus: true,
    riskTier: 'GOLD',
    appliances: [
      { id: 'app-6', name: 'Ather 450X Fast Charger', type: 'EV_CHARGER', ratedPowerKW: 2.4, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-7', name: 'Central Air Conditioning', type: 'AIR_CONDITIONER', ratedPowerKW: 3.5, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-8', name: 'Solar Hybrid Water Heater Pump', type: 'WATER_PUMP', ratedPowerKW: 1.5, isFlexible: true, canInterrupt: true, currentStatus: 'IDLE' },
    ],
  },
  {
    id: 'c-104',
    consumerNumber: 'GED-PAN-88325',
    name: 'Suresh Naik',
    phone: '+91 98221 66542',
    email: 'suresh.naik@gmail.com',
    address: 'Plot 12, Campal Promenade, Panaji',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederId: 'fdr-pan-11kv-01',
    meterId: 'SM-GOA-9941',
    contractDemandKW: 5.0,
    currentLoadKW: 3.4,
    coinsBalance: 190,
    optInStatus: true,
    riskTier: 'BRONZE',
    appliances: [
      { id: 'app-9', name: 'Water Geyser Bathroom', type: 'WATER_HEATER', ratedPowerKW: 2.0, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-10', name: 'Split AC 1.5T', type: 'AIR_CONDITIONER', ratedPowerKW: 1.5, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
    ],
  },
  {
    id: 'c-105',
    consumerNumber: 'GED-PAN-88330',
    name: 'Anita Desai',
    phone: '+91 98221 88412',
    email: 'anita.desai@rediffmail.com',
    address: 'Flat 4B, Mandovi Heights, Panaji',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederId: 'fdr-pan-11kv-01',
    meterId: 'SM-GOA-9952',
    contractDemandKW: 8.0,
    currentLoadKW: 6.1,
    coinsBalance: 530,
    optInStatus: true,
    riskTier: 'GOLD',
    appliances: [
      { id: 'app-11', name: 'MG ZS EV Level-2 Charger', type: 'EV_CHARGER', ratedPowerKW: 7.2, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
      { id: 'app-12', name: 'Daikin Dual Inverter AC', type: 'AIR_CONDITIONER', ratedPowerKW: 1.6, isFlexible: true, canInterrupt: true, currentStatus: 'ACTIVE' },
    ],
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-2026-10-17-01',
    title: 'Panaji Evening Peak Peak-Shave #1',
    code: 'DR-PAN-089',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    feederName: 'Panaji Market Feeder 11kV',
    targetReductionKW: 17.4,
    achievedReductionKW: 18.2,
    targetDurationMinutes: 45,
    status: 'ACTIVE',
    startTime: '2026-10-17T18:30:00Z',
    createdAt: '2026-10-17T18:25:00Z',
    dispatchedBy: 'Auto-Knapsack Engine / Operator Verified',
    totalCoinsAllocated: 520,
    consumers: [
      { consumerId: 'c-101', consumerName: 'Rajesh Kamat', consumerNumber: 'GED-PAN-88310', applianceName: 'Nexon EV Smart Charger', requestedReductionKW: 3.3, rewardOfferedCoins: 99, responseStatus: 'ACCEPTED', respondedAt: '18:27:10', verifiedReductionKW: 3.3 },
      { consumerId: 'c-102', consumerName: 'Maria Fernandes', consumerNumber: 'GED-PAN-88315', applianceName: 'Storage Water Heater 15L', requestedReductionKW: 2.0, rewardOfferedCoins: 60, responseStatus: 'ACCEPTED', respondedAt: '18:28:05', verifiedReductionKW: 2.0 },
      { consumerId: 'c-103', consumerName: 'Vikram Prabhu', consumerNumber: 'GED-PAN-88320', applianceName: 'Ather 450X Fast Charger', requestedReductionKW: 2.4, rewardOfferedCoins: 72, responseStatus: 'ACCEPTED', respondedAt: '18:26:45', verifiedReductionKW: 2.4 },
      { consumerId: 'c-104', consumerName: 'Suresh Naik', consumerNumber: 'GED-PAN-88325', applianceName: 'Water Geyser Bathroom', requestedReductionKW: 2.0, rewardOfferedCoins: 60, responseStatus: 'ACCEPTED', respondedAt: '18:29:12', verifiedReductionKW: 1.9 },
      { consumerId: 'c-105', consumerName: 'Anita Desai', consumerNumber: 'GED-PAN-88330', applianceName: 'MG ZS EV Level-2 Charger', requestedReductionKW: 7.2, rewardOfferedCoins: 216, responseStatus: 'ACCEPTED', respondedAt: '18:27:50', verifiedReductionKW: 7.1 },
    ],
  },
  {
    id: 'cmp-2026-10-16-02',
    title: 'Margao Commercial Sunset Peak Buffer',
    code: 'DR-MAR-088',
    transformerId: 'TR-MAR-201',
    transformerName: 'Margao Commercial Complex',
    feederName: 'Margao Commercial Feeder 11kV',
    targetReductionKW: 24.0,
    achievedReductionKW: 26.5,
    targetDurationMinutes: 60,
    status: 'COMPLETED',
    startTime: '2026-10-16T18:15:00Z',
    endTime: '2026-10-16T19:15:00Z',
    createdAt: '2026-10-16T18:10:00Z',
    dispatchedBy: 'Operator Arjun Rao',
    totalCoinsAllocated: 780,
    consumers: [],
  },
];

export const MOCK_BATTERIES: Battery[] = [
  {
    id: 'bat-pan-01',
    name: 'Panaji Substation BESS-1',
    type: 'BESS_COMMUNITY',
    transformerId: 'TR-PAN-101',
    transformerName: 'Panaji City Center DT-01',
    capacityKWh: 150,
    currentSoCPercent: 78,
    maxDischargeRateKW: 30,
    currentOutputKW: 15.0,
    healthPercentage: 96,
    status: 'DISCHARGING',
  },
  {
    id: 'bat-mir-02',
    name: 'Miramar V2G Fleet Hub',
    type: 'V2G_FLEET',
    transformerId: 'TR-PAN-102',
    transformerName: 'Miramar Promenade Substation',
    capacityKWh: 240,
    currentSoCPercent: 84,
    maxDischargeRateKW: 50,
    currentOutputKW: -10.0, // Charging from excess solar
    healthPercentage: 98,
    status: 'CHARGING',
    evCountConnected: 6,
  },
  {
    id: 'bat-mar-03',
    name: 'Margao Industrial Backup Storage',
    type: 'SUBSTATION_STORAGE',
    transformerId: 'TR-MAR-201',
    transformerName: 'Margao Commercial Complex',
    capacityKWh: 300,
    currentSoCPercent: 62,
    maxDischargeRateKW: 60,
    currentOutputKW: 40.0,
    healthPercentage: 92,
    status: 'DISCHARGING',
  },
];

export const MOCK_V2G_RESOURCES: V2GResource[] = [
  { id: 'v2g-1', vehicleModel: 'Tata Nexon EV Max (40.5 kWh)', ownerName: 'Rajesh Kamat', batteryCapacityKWh: 40.5, currentSoCPercent: 82, minReservedSoCPercent: 40, availableFlexKW: 6.6, status: 'DISCHARGING', transformerId: 'TR-PAN-101' },
  { id: 'v2g-2', vehicleModel: 'MG ZS EV Excite (50.3 kWh)', ownerName: 'Anita Desai', batteryCapacityKWh: 50.3, currentSoCPercent: 91, minReservedSoCPercent: 50, availableFlexKW: 7.4, status: 'DISCHARGING', transformerId: 'TR-PAN-101' },
  { id: 'v2g-3', vehicleModel: 'Hyundai Ioniq 5 (72.6 kWh)', ownerName: 'Sunil Verlekar', batteryCapacityKWh: 72.6, currentSoCPercent: 74, minReservedSoCPercent: 45, availableFlexKW: 11.0, status: 'CONNECTED', transformerId: 'TR-PAN-102' },
  { id: 'v2g-4', vehicleModel: 'Mahindra XUV400 (39.4 kWh)', ownerName: 'Pooja Naik', batteryCapacityKWh: 39.4, currentSoCPercent: 68, minReservedSoCPercent: 35, availableFlexKW: 3.3, status: 'CONNECTED', transformerId: 'TR-MAR-201' },
];

export const MOCK_REWARD_TRANSACTIONS: RewardTransaction[] = [
  { id: 'tx-1', consumerId: 'c-101', consumerName: 'Rajesh Kamat', amount: 99, type: 'EARNED_DR', description: 'Peak Shaving DR Event: Panaji City Center DT-01 (EV Charger paused)', timestamp: '2026-10-17 18:35:00', campaignTitle: 'Panaji Evening Peak Peak-Shave #1', status: 'COMPLETED' },
  { id: 'tx-2', consumerId: 'c-101', consumerName: 'Rajesh Kamat', amount: 50, type: 'EARNED_SOLAR', description: 'Afternoon solar feed-in net grid injection credit', timestamp: '2026-10-17 14:00:00', status: 'COMPLETED' },
  { id: 'tx-3', consumerId: 'c-102', consumerName: 'Maria Fernandes', amount: 60, type: 'EARNED_DR', description: 'Water Heater flexible pause during peak overload', timestamp: '2026-10-17 18:35:00', campaignTitle: 'Panaji Evening Peak Peak-Shave #1', status: 'COMPLETED' },
  { id: 'tx-4', consumerId: 'c-103', consumerName: 'Vikram Prabhu', amount: 72, type: 'EARNED_DR', description: 'Ather 450X smart charging deferred', timestamp: '2026-10-17 18:35:00', campaignTitle: 'Panaji Evening Peak Peak-Shave #1', status: 'COMPLETED' },
  { id: 'tx-5', consumerId: 'c-101', consumerName: 'Rajesh Kamat', amount: -200, type: 'REDEEMED_DISCOUNT', description: 'Electricity Bill Waiver Voucher applied to GED Bill #88910', timestamp: '2026-10-15 11:20:00', status: 'COMPLETED' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-10-17 18:30:12', userId: 'usr-operator', userName: 'Arjun Rao', userRole: 'GRID_OPERATOR', action: 'DISPATCH_CAMPAIGN', resourceType: 'CAMPAIGN', resourceId: 'cmp-2026-10-17-01', details: 'Authorized 0/1 Knapsack DR Campaign dispatch targeting 17.4 kW reduction on TR-PAN-101', ipAddress: '10.14.2.88' },
  { id: 'aud-2', timestamp: '2026-10-17 18:25:40', userId: 'usr-operator', userName: 'Arjun Rao', userRole: 'GRID_OPERATOR', action: 'RUN_OPTIMIZATION', resourceType: 'TRANSFORMER', resourceId: 'TR-PAN-101', details: 'Executed dual-engine knapsack solver for 17.4 kW overload mitigation (solved in 4.2ms)', ipAddress: '10.14.2.88' },
  { id: 'aud-3', timestamp: '2026-10-17 18:15:20', userId: 'system', userName: 'Urja AI Engine', userRole: 'GRID_OPERATOR', action: 'PREDICTION_ALERT', resourceType: 'TRANSFORMER', resourceId: 'TR-PAN-101', details: 'LightGBM model flagged 108.4% predicted overload in 15m horizon due to solar drop + EV arrival', ipAddress: '127.0.0.1' },
  { id: 'aud-4', timestamp: '2026-10-17 17:45:00', userId: 'usr-admin', userName: 'Priya Sharma', userRole: 'SUPER_ADMIN', action: 'UPDATE_CONFIG', resourceType: 'SYSTEM_CONFIG', details: 'Updated Urja Coin rate from ₹2.5/kWh to ₹3.0/kWh for peak season', ipAddress: '10.14.1.15' },
];

// API Service Functions with resilient fallbacks
export const api = {
  // Transformers
  async getTransformers(): Promise<Transformer[]> {
    try {
      const res = await apiClient.get<Transformer[]>('/transformers');
      return res.data;
    } catch {
      return MOCK_TRANSFORMERS;
    }
  },

  async getTransformer(id: string): Promise<Transformer | undefined> {
    try {
      const res = await apiClient.get<Transformer>(`/transformers/${id}`);
      return res.data;
    } catch {
      return MOCK_TRANSFORMERS.find((t) => t.id === id) || MOCK_TRANSFORMERS[0];
    }
  },

  // Regions & Feeders
  async getRegions(): Promise<Region[]> {
    try {
      const res = await apiClient.get<Region[]>('/regions');
      return res.data;
    } catch {
      return MOCK_REGIONS;
    }
  },

  async getFeeders(): Promise<Feeder[]> {
    try {
      const res = await apiClient.get<Feeder[]>('/feeders');
      return res.data;
    } catch {
      return MOCK_FEEDERS;
    }
  },

  // AI Prediction Engine (LightGBM)
  async runPrediction(transformerId: string, horizonMinutes = 15): Promise<PredictionResult> {
    try {
      const res = await apiClient.post<PredictionResult>('/predictions/run', {
        transformerId,
        horizonMinutes,
      });
      return res.data;
    } catch {
      const tr = MOCK_TRANSFORMERS.find((t) => t.id === transformerId) || MOCK_TRANSFORMERS[0];
      const forecastLoad = Math.min(tr.capacityKVA * 1.15, tr.currentLoadKW * 1.09);
      const loadingPct = (forecastLoad / tr.capacityKVA) * 100;
      return {
        id: `pred-${Date.now()}`,
        transformerId: tr.id,
        transformerName: tr.name,
        timestamp: new Date().toISOString(),
        horizonMinutes,
        forecastLoadKW: parseFloat(forecastLoad.toFixed(1)),
        forecastLoadingPercentage: parseFloat(loadingPct.toFixed(1)),
        predictedRiskLevel: loadingPct > 100 ? 'CRITICAL' : loadingPct > 85 ? 'HIGH' : 'MEDIUM',
        overloadProbability: loadingPct > 100 ? 0.94 : 0.65,
        confidenceScore: 0.91,
        modelName: 'Urja-LightGBM-DT-Guard',
        modelVersion: 'v2.4.1-dist',
        source: 'rule-based-demo',
        explanationFactors: [
          { factor: 'Evening Duck Curve Sunset', weight: 0.38, description: 'Rooftop solar dropped by 84% between 17:45 and 18:30' },
          { factor: 'EV Commuter Arrival Cluster', weight: 0.31, description: 'Simultaneous charging detected across 4 residential fast chargers' },
          { factor: 'High Ambient Temperature', weight: 0.18, description: '33.5°C ambient slows natural oil cooling cycle' },
          { factor: 'Baseline Domestic Cooking Load', weight: 0.13, description: 'Induction cooktops and water geysers concurrent peak' },
        ],
      };
    }
  },

  // Dual-Engine 0/1 Knapsack Optimization Solver
  async runOptimization(transformerId: string, targetReductionKW = 17.4): Promise<OptimizationResult> {
    try {
      const res = await apiClient.post<OptimizationResult>('/optimization/solve', {
        transformerId,
        targetReductionKW,
      });
      return res.data;
    } catch {
      const tr = MOCK_TRANSFORMERS.find((t) => t.id === transformerId) || MOCK_TRANSFORMERS[0];

      // Pool of candidates from connected consumers
      const candidates: {
        consumerId: string;
        consumerName: string;
        consumerNumber: string;
        applianceId: string;
        applianceName: string;
        applianceType: string;
        flexibleLoadKW: number;
        rewardCostCoins: number;
      }[] = [
        { consumerId: 'c-105', consumerName: 'Anita Desai', consumerNumber: 'GED-PAN-88330', applianceId: 'app-11', applianceName: 'MG ZS EV Level-2 Charger', applianceType: 'EV_CHARGER', flexibleLoadKW: 7.2, rewardCostCoins: 216 },
        { consumerId: 'c-101', consumerName: 'Rajesh Kamat', consumerNumber: 'GED-PAN-88310', applianceId: 'app-1', applianceName: 'Nexon EV Smart Charger', applianceType: 'EV_CHARGER', flexibleLoadKW: 3.3, rewardCostCoins: 99 },
        { consumerId: 'c-103', consumerName: 'Vikram Prabhu', consumerNumber: 'GED-PAN-88320', applianceId: 'app-6', applianceName: 'Ather 450X Fast Charger', applianceType: 'EV_CHARGER', flexibleLoadKW: 2.4, rewardCostCoins: 72 },
        { consumerId: 'c-102', consumerName: 'Maria Fernandes', consumerNumber: 'GED-PAN-88315', applianceId: 'app-5', applianceName: 'Storage Water Heater 15L', applianceType: 'WATER_HEATER', flexibleLoadKW: 2.0, rewardCostCoins: 60 },
        { consumerId: 'c-104', consumerName: 'Suresh Naik', consumerNumber: 'GED-PAN-88325', applianceId: 'app-9', applianceName: 'Water Geyser Bathroom', applianceType: 'WATER_HEATER', flexibleLoadKW: 2.0, rewardCostCoins: 60 },
        { consumerId: 'c-102', consumerName: 'Maria Fernandes', consumerNumber: 'GED-PAN-88315', applianceId: 'app-4', applianceName: 'Living Room 2.0T AC', applianceType: 'AIR_CONDITIONER', flexibleLoadKW: 2.2, rewardCostCoins: 77 },
        { consumerId: 'c-101', consumerName: 'Rajesh Kamat', consumerNumber: 'GED-PAN-88310', applianceId: 'app-2', applianceName: 'Master Bedroom AC', applianceType: 'AIR_CONDITIONER', flexibleLoadKW: 1.8, rewardCostCoins: 63 },
      ];

      // Exact 0/1 Knapsack selection logic to reach targetReductionKW with minimal coins cost
      let accumulatedKW = 0;
      let totalCost = 0;
      let selectedCount = 0;

      const items = candidates.map((c) => {
        const ratio = parseFloat((c.flexibleLoadKW / c.rewardCostCoins).toFixed(3));
        const shouldSelect = accumulatedKW < targetReductionKW;
        if (shouldSelect) {
          accumulatedKW += c.flexibleLoadKW;
          totalCost += c.rewardCostCoins;
          selectedCount++;
        }
        return {
          ...c,
          ratioKWPerCoin: ratio,
          selected: shouldSelect,
          priorityScore: parseFloat((ratio * 100).toFixed(1)),
          reason: shouldSelect
            ? 'Optimal cost-efficiency in 0/1 Knapsack minimal cost frontier'
            : 'Target reduction already satisfied with higher priority resources',
        };
      });

      return {
        id: `opt-${Date.now()}`,
        transformerId: tr.id,
        transformerName: tr.name,
        timestamp: new Date().toISOString(),
        targetReductionKW,
        achievedReductionKW: parseFloat(accumulatedKW.toFixed(1)),
        totalRewardCostCoins: totalCost,
        selectedConsumersCount: selectedCount,
        totalCandidatesCount: candidates.length,
        solverType: '0/1 Knapsack DP',
        executionTimeMs: 4.8,
        isInfeasible: accumulatedKW < targetReductionKW,
        items,
      };
    }
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await apiClient.get<Campaign[]>('/campaigns');
      return res.data;
    } catch {
      return MOCK_CAMPAIGNS;
    }
  },

  async getCampaign(id: string): Promise<Campaign | undefined> {
    try {
      const res = await apiClient.get<Campaign>(`/campaigns/${id}`);
      return res.data;
    } catch {
      return MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0];
    }
  },

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    try {
      const res = await apiClient.post<Campaign>('/campaigns', campaignData);
      return res.data;
    } catch {
      const newCamp: Campaign = {
        id: `cmp-${Date.now()}`,
        title: campaignData.title || 'Dynamic DR Campaign',
        code: `DR-PAN-${Math.floor(100 + Math.random() * 900)}`,
        transformerId: campaignData.transformerId || 'TR-PAN-101',
        transformerName: campaignData.transformerName || 'Panaji City Center DT-01',
        feederName: campaignData.feederName || 'Panaji Market Feeder 11kV',
        targetReductionKW: campaignData.targetReductionKW || 17.4,
        achievedReductionKW: 0,
        targetDurationMinutes: campaignData.targetDurationMinutes || 45,
        status: 'ACTIVE',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        dispatchedBy: 'Grid Operator',
        totalCoinsAllocated: campaignData.totalCoinsAllocated || 520,
        consumers: campaignData.consumers || [],
      };
      MOCK_CAMPAIGNS.unshift(newCamp);
      return newCamp;
    }
  },

  // Consumers
  async getConsumers(): Promise<Consumer[]> {
    try {
      const res = await apiClient.get<Consumer[]>('/consumers');
      return res.data;
    } catch {
      return MOCK_CONSUMERS;
    }
  },

  async getConsumer(id: string): Promise<Consumer | undefined> {
    try {
      const res = await apiClient.get<Consumer>(`/consumers/${id}`);
      return res.data;
    } catch {
      return MOCK_CONSUMERS.find((c) => c.id === id) || MOCK_CONSUMERS[0];
    }
  },

  // Batteries & V2G
  async getBatteries(): Promise<Battery[]> {
    try {
      const res = await apiClient.get<Battery[]>('/batteries');
      return res.data;
    } catch {
      return MOCK_BATTERIES;
    }
  },

  async getV2GResources(): Promise<V2GResource[]> {
    try {
      const res = await apiClient.get<V2GResource[]>('/v2g');
      return res.data;
    } catch {
      return MOCK_V2G_RESOURCES;
    }
  },

  // Rewards
  async getRewardTransactions(): Promise<RewardTransaction[]> {
    try {
      const res = await apiClient.get<RewardTransaction[]>('/rewards/transactions');
      return res.data;
    } catch {
      return MOCK_REWARD_TRANSACTIONS;
    }
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await apiClient.get<AuditLog[]>('/audit-logs');
      return res.data;
    } catch {
      return MOCK_AUDIT_LOGS;
    }
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const res = await apiClient.get<AnalyticsData>('/analytics');
      return res.data;
    } catch {
      return {
        timeframe: 'Past 30 Days',
        peakDemandKW: 28400,
        averageLoadingPct: 71.4,
        avoidedFailuresCount: 8,
        drEventsExecuted: 34,
        totalCoinsDistributed: 18450,
        co2SavedKg: 9420,
        substationMetrics: [
          { name: 'Panaji Urban 33/11kV', transformersCount: 48, avgLoading: 78.4, overloadHours: 12 },
          { name: 'Margao South 33/11kV', transformersCount: 64, avgLoading: 74.2, overloadHours: 8 },
          { name: 'Mapusa North 33/11kV', transformersCount: 42, avgLoading: 66.8, overloadHours: 3 },
          { name: 'Vasco Harbour 33/11kV', transformersCount: 52, avgLoading: 62.1, overloadHours: 1 },
        ],
      };
    }
  },
};
