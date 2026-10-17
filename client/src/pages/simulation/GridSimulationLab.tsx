import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { SimulationScenario } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Clock,
  Zap,
  Sun,
  Thermometer,
  Activity,
  AlertTriangle,
  BatteryCharging,
  Radio,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const GridSimulationLab: React.FC = () => {
  const {
    state,
    transformers,
    events,
    start,
    pause,
    resume,
    reset,
    stepForward,
    setSpeed,
    setScenario,
    injectPeak,
    dropSolar,
    surgeEV,
    increaseHVAC,
    sensorFailure,
    applyKnapsackMitigation,
  } = useSimulationStore();

  const scenarios: { id: SimulationScenario; label: string }[] = [
    { id: 'EVENING_PEAK', label: 'Evening Peak (18:00 - 20:00)' },
    { id: 'SOLAR_DROP', label: 'Sunset Solar Cliff (-85% PV)' },
    { id: 'HEATWAVE', label: 'High Ambient Heatwave (39°C)' },
    { id: 'EV_SURGE', label: 'Clustered EV Fast Charging' },
    { id: 'NORMAL', label: 'Normal Afternoon Baseline' },
    { id: 'EXTREME_STRESS', label: 'Extreme Grid Stress / Multi-Factor' },
  ];

  const primaryTransformer = transformers.find((t) => t.id === 'TR-PAN-101') || transformers[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Simulation Console */}
      <div className="bg-[#171D22] text-white p-6 rounded-2xl border border-[#2D3640] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#2D3640]">
          {/* Prominent Simulated Clock */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#1E252C] rounded-2xl border border-[#2D3640] text-[#7F9565]">
              <Clock className="w-8 h-8 text-[#368F8A]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-mono">
                SIMULATED GRID TIME
              </p>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-wider">
                  {state.simulatedTime}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#368F8A]/20 text-[#368F8A] border border-[#368F8A]/30 uppercase">
                  {state.status}
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Controls: Play, Pause, Step, Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {state.status === 'RUNNING' ? (
              <Button
                variant="coral"
                onClick={pause}
                leftIcon={<Pause className="w-4 h-4" />}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={start}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Start Simulation
              </Button>
            )}

            <Button
              variant="darkOutline"
              onClick={stepForward}
              leftIcon={<StepForward className="w-4 h-4" />}
            >
              Step +30s
            </Button>

            <Button
              variant="darkOutline"
              onClick={reset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-[#1E252C] p-1 rounded-lg border border-[#2D3640] ml-2">
              {([1, 2, 5, 10] as (1 | 2 | 5 | 10)[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                    state.speed === spd
                      ? 'bg-[#368F8A] text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Grid Environmental Conditions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-[#1E252C] p-3 rounded-xl border border-[#2D3640]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Ambient Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-[#E56F59]" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{state.ambientTemperatureC}°C</p>
          </div>

          <div className="bg-[#1E252C] p-3 rounded-xl border border-[#2D3640]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Solar Radiation</span>
              <Sun className="w-3.5 h-3.5 text-[#E5A23D]" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{state.solarRadiationPct}%</p>
          </div>

          <div className="bg-[#1E252C] p-3 rounded-xl border border-[#2D3640]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Grid Frequency</span>
              <Activity className="w-3.5 h-3.5 text-[#24845B]" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{state.gridFrequencyHz} Hz</p>
          </div>

          <div className="bg-[#1E252C] p-3 rounded-xl border border-[#2D3640]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Active Scenario</span>
              <Sliders className="w-3.5 h-3.5 text-[#7F9565]" />
            </div>
            <select
              value={state.scenario}
              onChange={(e) => setScenario(e.target.value as SimulationScenario)}
              className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer w-full"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1E252C] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Event Injection Control Pad */}
      <Card className="bg-white p-5 border-[#E3DED2]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#191919]">
              Live Grid Stress Injection Triggers
            </h3>
            <p className="text-xs text-[#6B7280]">
              Inject sudden real-world electrical disturbances into the simulation model
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">Target: TR-PAN-101</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={injectPeak}
            className="hover:border-[#D94F45] hover:text-[#D94F45]"
            leftIcon={<Zap className="w-3.5 h-3.5 text-[#D94F45]" />}
          >
            Inject Overload
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={dropSolar}
            className="hover:border-[#E5A23D] hover:text-[#E5A23D]"
            leftIcon={<Sun className="w-3.5 h-3.5 text-[#E5A23D]" />}
          >
            Drop Solar PV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={surgeEV}
            className="hover:border-[#E56F59] hover:text-[#E56F59]"
            leftIcon={<BatteryCharging className="w-3.5 h-3.5 text-[#E56F59]" />}
          >
            EV Surge (+18 kW)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={increaseHVAC}
            className="hover:border-[#E56F59] hover:text-[#E56F59]"
            leftIcon={<Thermometer className="w-3.5 h-3.5 text-[#E56F59]" />}
          >
            HVAC Spike
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={sensorFailure}
            className="hover:border-gray-500"
            leftIcon={<Radio className="w-3.5 h-3.5 text-gray-500" />}
          >
            Drop Telemetry
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={applyKnapsackMitigation}
            className="font-bold shadow-xs"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Knapsack Mitigate
          </Button>
        </div>
      </Card>

      {/* Real-Time Load & Thermal Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Real-time Curve */}
        <div className="lg:col-span-8">
          <Card variant="dark" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Panaji DT-01: Real-Time Dynamic Load Response
                </h3>
                <p className="text-xs text-gray-400">
                  Rated 100 kVA • Current Load: {primaryTransformer.currentLoadKW} kW ({primaryTransformer.loadingPercentage}%)
                </p>
              </div>
              <StatusBadge status={primaryTransformer.status} />
            </div>

            <LoadProfileChart
              capacityKW={primaryTransformer.capacityKVA}
              isDark={true}
              height={260}
            />
          </Card>
        </div>

        {/* Before / After Optimization Comparison */}
        <div className="lg:col-span-4">
          <Card className="bg-white p-5 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Knapsack 0/1 Mitigation Impact
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 my-auto">
              <div className="p-3.5 rounded-xl bg-[#D94F45]/10 border border-[#D94F45]/30">
                <div className="flex items-center justify-between text-xs font-bold text-[#D94F45]">
                  <span>BEFORE MITIGATION (Uncontrolled)</span>
                  <span>108.5% Load</span>
                </div>
                <div className="mt-2 text-xs text-gray-700 space-y-1">
                  <p>• Peak Overload: 108.5 kW (8.5 kW above rated limit)</p>
                  <p>• Top-Oil Temp: 94.2°C (Approaching 95°C thermal trip)</p>
                  <p>• Risk: Breaker trip & localized feeder blackout</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#24845B]/10 border border-[#24845B]/30">
                <div className="flex items-center justify-between text-xs font-bold text-[#24845B]">
                  <span>AFTER 0/1 KNAPSACK DR</span>
                  <span>81.0% Safe</span>
                </div>
                <div className="mt-2 text-xs text-gray-700 space-y-1">
                  <p>• Shed Achieved: 17.4 kW (5 consumer appliances)</p>
                  <p>• Top-Oil Temp: 74.0°C (Stable within safe envelope)</p>
                  <p>• Incentive Cost: 520 Urja Coins (₹1,560 total)</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DED2] text-center">
              <Button
                variant="teal"
                size="sm"
                className="w-full"
                onClick={applyKnapsackMitigation}
              >
                Apply 0/1 Knapsack Shedding Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
