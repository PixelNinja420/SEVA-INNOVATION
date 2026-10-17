import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { MOCK_CONSUMERS } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import { TemperatureTrendChart } from '@/components/charts/TemperatureTrendChart';
import {
  Zap,
  Thermometer,
  ShieldAlert,
  Target,
  BrainCircuit,
  ArrowLeft,
  Users,
  Calendar,
  Wrench,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const TransformerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transformers } = useSimulationStore();

  const transformer = transformers.find((t) => t.id === id) || transformers[0];

  const connectedConsumers = MOCK_CONSUMERS.filter(
    (c) => c.transformerId === transformer.id || transformer.id === 'TR-PAN-101'
  );

  return (
    <div className="space-y-6">
      {/* Back and Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transformers')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Fleet
          </Button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
                {transformer.name}
              </h1>
              <StatusBadge status={transformer.status} />
              <StatusBadge status={transformer.riskLevel} />
            </div>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
              {transformer.code} • {transformer.feederName} • {transformer.regionName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`/predictions?transformerId=${transformer.id}`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BrainCircuit className="w-4 h-4 text-[#368F8A]" />}
            >
              Run AI Prediction
            </Button>
          </Link>
          <Link to={`/optimization?transformerId=${transformer.id}`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Target className="w-4 h-4" />}
            >
              Solve Knapsack DR
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Telemetry Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Loading Percentage
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span
              className={`text-3xl font-extrabold font-mono ${
                transformer.loadingPercentage >= 100
                  ? 'text-[#D94F45]'
                  : transformer.loadingPercentage >= 85
                  ? 'text-[#E5A23D]'
                  : 'text-[#24845B]'
              }`}
            >
              {transformer.loadingPercentage}%
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 font-mono">
            {transformer.currentLoadKW} kW of {transformer.capacityKVA} kVA rating
          </p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Top-Oil Temperature
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span
              className={`text-3xl font-extrabold font-mono ${
                transformer.oilTemperature >= 90
                  ? 'text-[#D94F45]'
                  : transformer.oilTemperature >= 75
                  ? 'text-[#E5A23D]'
                  : 'text-[#24845B]'
              }`}
            >
              {transformer.oilTemperature}°C
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Limit: 95°C • Ambient: {transformer.ambientTemperature}°C
          </p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Hot-Spot Winding Temp
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-[#E56F59]">
              {transformer.windingTemperature}°C
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            IEEE C57.91 Insulation Aging: Normal
          </p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Health Index
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-[#368F8A]">
              {transformer.healthIndex}/100
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Installed: {transformer.installationYear} • Serviced: {transformer.lastServicedDate}
          </p>
        </Card>
      </div>

      {/* Charts Row: Historical Load + Temperature Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Load Profile vs Rated Capacity (24h)
              </CardTitle>
            </CardHeader>
            <LoadProfileChart capacityKW={transformer.capacityKVA} height={240} />
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Oil & Winding Thermal Curves
              </CardTitle>
            </CardHeader>
            <TemperatureTrendChart height={240} />
          </Card>
        </div>
      </div>

      {/* Connected Consumers & Appliances List */}
      <Card className="p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#191919]">
              Connected Flexible Demand Response Resources
            </h3>
            <p className="text-xs text-[#6B7280]">
              Consumers enrolled in Urja Coins flexible demand shedding program on this transformer
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7F9565]/10 text-[#6B7F52]">
            {connectedConsumers.length} Enrolled Consumers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F2E9] text-[#6B7280] uppercase text-[10px]">
              <tr>
                <th className="p-3">Consumer</th>
                <th className="p-3">Meter ID</th>
                <th className="p-3">Contract Demand</th>
                <th className="p-3">Flexible Appliances</th>
                <th className="p-3">Reward Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DED2]">
              {connectedConsumers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5F2E9]/40">
                  <td className="p-3 font-semibold text-[#191919]">
                    {c.name}
                    <div className="text-[10px] text-gray-500 font-normal">{c.consumerNumber}</div>
                  </td>
                  <td className="p-3 font-mono text-gray-600">{c.meterId}</td>
                  <td className="p-3 font-mono">{c.contractDemandKW} kW</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.appliances.map((app) => (
                        <span
                          key={app.id}
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium"
                        >
                          {app.name} ({app.ratedPowerKW} kW)
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-[#7F9565] font-mono">
                    {c.coinsBalance} Coins
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center text-[10px] font-semibold text-[#24845B]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Ready for Dispatch
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
