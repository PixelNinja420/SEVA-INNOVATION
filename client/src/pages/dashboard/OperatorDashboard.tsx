import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { useRegionStore } from '@/stores/regionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import { HealthDonutChart } from '@/components/charts/HealthDonutChart';
import {
  Zap,
  AlertTriangle,
  Megaphone,
  Sun,
  Activity,
  ArrowUpRight,
  Target,
  Play,
  Pause,
  Clock,
  Map as MapIcon,
  Cpu,
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const { transformers, events, state: simState, start, pause } = useSimulationStore();
  const { selectedRegion } = useRegionStore();

  const totalTransformers = transformers.length;
  const criticalCount = transformers.filter((t) => t.status === 'CRITICAL').length;
  const warningCount = transformers.filter((t) => t.status === 'WARNING').length;
  const atRiskCount = criticalCount + warningCount;

  const totalLoadKW = transformers.reduce((acc, t) => acc + t.currentLoadKW, 0);
  const totalCapacityKVA = transformers.reduce((acc, t) => acc + t.capacityKVA, 0);
  const fleetLoadingPct = ((totalLoadKW / totalCapacityKVA) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner: Control Room Header with Real-time Clock and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171D22] text-white p-5 rounded-2xl border border-[#2D3640] shadow-md">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Distribution Grid Control Center
            </h1>
            <span className="bg-[#368F8A]/20 text-[#368F8A] text-xs font-bold px-2 py-0.5 rounded-full border border-[#368F8A]/40">
              {selectedRegion.name}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time telemetry ingestion active • LightGBM 15m ahead predictive monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#1E252C] px-3 py-1.5 rounded-xl border border-[#2D3640] text-xs font-mono">
            <Clock className="w-4 h-4 text-[#7F9565]" />
            <span className="text-emerald-400 font-bold">{simState.simulatedTime}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-300 capitalize">{simState.scenario.toLowerCase().replace('_', ' ')}</span>
          </div>

          <Button
            variant="teal"
            size="sm"
            onClick={() => (simState.status === 'RUNNING' ? pause() : start())}
            leftIcon={simState.status === 'RUNNING' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {simState.status === 'RUNNING' ? 'Pause Sim' : 'Resume Sim'}
          </Button>

          <Link to="/simulation">
            <Button variant="primary" size="sm" leftIcon={<Cpu className="w-3.5 h-3.5" />}>
              Simulation Lab
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Transformers"
          value={totalTransformers}
          unit="units"
          icon={<Zap className="w-5 h-5" />}
          variant="default"
        />

        <KPICard
          label="Transformers At Risk"
          value={atRiskCount}
          unit="critical/warn"
          highlightColor="critical"
          change={+12.5}
          changeLabel="vs yesterday"
          icon={<AlertTriangle className="w-5 h-5 text-[#D94F45]" />}
          variant="default"
        />

        <KPICard
          label="Active DR Campaigns"
          value="1"
          unit="active"
          highlightColor="teal"
          icon={<Megaphone className="w-5 h-5 text-[#368F8A]" />}
          variant="default"
        />

        <KPICard
          label="Fleet Loading"
          value={`${fleetLoadingPct}%`}
          unit={`${totalLoadKW.toFixed(0)}/${totalCapacityKVA} kW`}
          highlightColor="warning"
          icon={<Activity className="w-5 h-5 text-[#E5A23D]" />}
          variant="default"
        />

        <KPICard
          label="Solar Generation"
          value={`${simState.solarRadiationPct}%`}
          unit="evening drop"
          highlightColor="coral"
          icon={<Sun className="w-5 h-5 text-[#E56F59]" />}
          variant="default"
        />
      </div>

      {/* Main Charts & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Load Forecast Chart (Control Room Panel) */}
        <div className="lg:col-span-8">
          <Card variant="dark" className="p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Panaji Sector DT-01: Load vs Capacity vs AI Forecast
                </h3>
                <p className="text-xs text-gray-400">
                  LightGBM 15m ahead forecast shows impending duck-curve evening peak
                </p>
              </div>
              <Link to="/predictions">
                <Button variant="darkOutline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  AI Predictions
                </Button>
              </Link>
            </div>

            <div className="flex-1 min-h-[280px]">
              <LoadProfileChart capacityKW={100} isDark={true} />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-[#2D3640] text-center text-xs">
              <div>
                <span className="text-gray-400">Current Load: </span>
                <span className="font-bold text-white">98.4 kW (98.4%)</span>
              </div>
              <div>
                <span className="text-gray-400">Forecast at 18:45: </span>
                <span className="font-bold text-[#E56F59]">108.5 kW (Trip Hazard)</span>
              </div>
              <div>
                <span className="text-gray-400">Required DR Shed: </span>
                <span className="font-bold text-[#368F8A]">17.4 kW</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Transformer Health Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base">Fleet Health Distribution</CardTitle>
            </CardHeader>
            <HealthDonutChart height={200} />
            <div className="space-y-2 mt-4 pt-3 border-t border-[#E3DED2]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#24845B]" /> Normal Operation
                </span>
                <span className="font-bold text-[#191919]">5 Transformers</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A23D]" /> Warning (85-99%)
                </span>
                <span className="font-bold text-[#E5A23D]">2 Transformers</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D94F45]" /> Critical / Overloaded
                </span>
                <span className="font-bold text-[#D94F45]">1 Transformer</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Grid Status Table & Real-Time Events Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* At Risk Transformers Table */}
        <div className="lg:col-span-8">
          <Card className="bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#191919]">
                  Monitored Distribution Transformers
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Click transformer for diagnostics, Knapsack solver, and thermal curve
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/map">
                  <Button variant="outline" size="sm" leftIcon={<MapIcon className="w-3.5 h-3.5" />}>
                    View on Map
                  </Button>
                </Link>
                <Link to="/transformers">
                  <Button variant="primary" size="sm">
                    All Transformers
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F2E9] text-[#6B7280] uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Transformer</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Current Load</th>
                    <th className="p-3">Loading %</th>
                    <th className="p-3">Oil Temp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DED2]">
                  {transformers.slice(0, 5).map((tr) => (
                    <tr key={tr.id} className="hover:bg-[#F5F2E9]/40 transition-colors">
                      <td className="p-3">
                        <Link to={`/transformers/${tr.id}`} className="font-bold text-[#191919] hover:text-[#7F9565]">
                          {tr.name}
                        </Link>
                        <p className="text-[10px] text-gray-500">{tr.code}</p>
                      </td>
                      <td className="p-3 font-mono">{tr.capacityKVA} kVA</td>
                      <td className="p-3 font-mono">{tr.currentLoadKW} kW</td>
                      <td className="p-3 font-bold font-mono">
                        <span
                          className={
                            tr.loadingPercentage >= 100
                              ? 'text-[#D94F45]'
                              : tr.loadingPercentage >= 85
                              ? 'text-[#E5A23D]'
                              : 'text-[#24845B]'
                          }
                        >
                          {tr.loadingPercentage}%
                        </span>
                      </td>
                      <td className="p-3 font-mono">{tr.oilTemperature}°C</td>
                      <td className="p-3">
                        <StatusBadge status={tr.status} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/optimization?transformerId=${tr.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                            Optimize
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Live Event Log */}
        <div className="lg:col-span-4">
          <Card variant="dark" className="p-5 h-full flex flex-col">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">Live Grid Telemetry Feed</CardTitle>
                <span className="w-2 h-2 rounded-full bg-[#24845B] animate-pulse" />
              </div>
            </CardHeader>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg bg-[#1E252C] border border-[#2D3640] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-[#D94F45]/20 text-[#D94F45]'
                          : evt.severity === 'WARNING'
                          ? 'bg-[#E5A23D]/20 text-[#E5A23D]'
                          : evt.severity === 'SUCCESS'
                          ? 'bg-[#24845B]/20 text-[#24845B]'
                          : 'bg-[#368F8A]/20 text-[#368F8A]'
                      }`}
                    >
                      {evt.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-[11px]">{evt.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
