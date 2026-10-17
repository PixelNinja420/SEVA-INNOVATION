import React, { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import {
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  BrainCircuit,
  Target,
  Megaphone,
  Coins,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Users,
} from 'lucide-react';

interface Step {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  narrative: string;
  actionText: string;
  executeAction: (store: any) => void;
  statusBadge: string;
}

export const GuidedDemo: React.FC = () => {
  const store = useSimulationStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Baseline Grid State',
      subtitle: '17:00 - Normal Afternoon Operation',
      description: 'The grid operates in nominal steady state. Rooftop solar generates strong local power.',
      narrative: 'Panaji City Center DT-01 operates at 52 kW (52% loading). Top-oil temperature is cool at 55°C. Distributed solar PV feeds 45 kW locally.',
      actionText: 'Initialize Baseline Grid State',
      executeAction: (s) => s.reset(),
      statusBadge: 'NORMAL',
    },
    {
      stepNumber: 2,
      title: 'Evening Peak & Sunset Onset',
      subtitle: '18:15 - Duck Curve Solar Cliff',
      description: 'The sun sets, causing rooftop solar generation to drop from 45 kW down to 2 kW while residential cooking begins.',
      narrative: 'Loss of solar generation abruptly shifts demand onto the distribution transformer. Loading rises swiftly toward 98.4 kW (98.4%).',
      actionText: 'Simulate Solar Drop & Load Surge',
      executeAction: (s) => s.dropSolar(),
      statusBadge: 'WARNING',
    },
    {
      stepNumber: 3,
      title: 'AI Predictive Overload Warning',
      subtitle: '18:30 - LightGBM Early Warning Engine',
      description: 'LightGBM model evaluates load momentum, ambient heat (33.5°C), and commuter arrival patterns.',
      narrative: 'AI forecasts 108.5 kW load (+8.5% overload) at 18:45. Flags CRITICAL thermal burnout hazard 15 minutes before physical trip occurs.',
      actionText: 'Trigger LightGBM 15m Ahead Forecast',
      executeAction: (s) => s.injectPeak(),
      statusBadge: 'CRITICAL',
    },
    {
      stepNumber: 4,
      title: '0/1 Knapsack Optimization',
      subtitle: '18:32 - Minimal Cost Load Shedding Formulation',
      description: 'The optimization engine calculates the minimal-cost subset of connected appliances needed to shed 17.4 kW.',
      narrative: 'Knapsack evaluates 7 flexible candidate appliances. Selects 5 appliances (EV chargers + water heaters) costing just 520 Urja Coins (₹1,560).',
      actionText: 'Solve 0/1 Knapsack Objective',
      executeAction: (_s) => {},
      statusBadge: 'WATCH',
    },
    {
      stepNumber: 5,
      title: 'Operator Review & Approval',
      subtitle: '18:33 - Human-in-the-Loop Dispatch',
      description: 'Senior Grid Dispatcher reviews the Knapsack recommendation in the control room console.',
      narrative: 'Operator confirms the 17.4 kW reduction plan and dispatches automated notifications to enrolled consumer mobile devices.',
      actionText: 'Approve & Dispatch DR Campaign',
      executeAction: (s) =>
        s.addEvent({
          type: 'CAMPAIGN_TRIGGERED',
          severity: 'INFO',
          message: 'Operator authorized 0/1 Knapsack DR dispatch to 5 households.',
        }),
      statusBadge: 'ACTIVE',
    },
    {
      stepNumber: 6,
      title: 'Consumer Mobile Notification',
      subtitle: '18:34 - Targeted PWA Alerts Sent',
      description: 'Selected consumers receive targeted demand-response requests on their mobile PWA.',
      narrative: 'Rajesh Kamat and 4 neighbors receive alert: "Pause Water Heater/EV for 45 mins. Earn +60 to +99 Urja Coins."',
      actionText: 'Simulate Consumer Acceptance',
      executeAction: (_s) => {},
      statusBadge: 'ACTIVE',
    },
    {
      stepNumber: 7,
      title: 'Coordinated Load Reduction',
      subtitle: '18:35 - Smart Appliance Curtailment',
      description: 'Smart EV chargers pause and water heater circuits cycle off automatically.',
      narrative: '18.2 kW of active demand drops off the feeder within 45 seconds of consumer acceptance, halting thermal accumulation.',
      actionText: 'Execute Remote Load Curtailment',
      executeAction: (s) => s.applyKnapsackMitigation(),
      statusBadge: 'SUCCESS',
    },
    {
      stepNumber: 8,
      title: 'Transformer Loading Normalized',
      subtitle: '18:38 - Thermal Stabilization',
      description: 'Panaji City Center DT-01 load falls safely back into the optimal operating window.',
      narrative: 'Loading drops from 108.5% down to 81.0%. Top-oil temperature stabilizes at 74°C. Local breaker trip completely averted.',
      actionText: 'Verify Grid Stabilization',
      executeAction: (_s) => {},
      statusBadge: 'NORMAL',
    },
    {
      stepNumber: 9,
      title: 'Urja Coins Rewards Distributed',
      subtitle: '18:45 - Token Incentive Disbursement',
      description: 'Consumer wallets credited with 520 total Urja Coins on the immutable verification ledger.',
      narrative: 'Rajesh Kamat receives +99 coins. Consumers see instant rewards redeemable as deductions on their next GED electricity bill.',
      actionText: 'Disburse Urja Coins Ledger',
      executeAction: (s) =>
        s.addEvent({
          type: 'LOAD_NORMALIZED',
          severity: 'SUCCESS',
          message: '520 Urja Coins disbursed across 5 participating consumer wallets.',
        }),
      statusBadge: 'COMPLETED',
    },
    {
      stepNumber: 10,
      title: 'Asset Protection & ROI Outcome',
      subtitle: 'Demonstration Summary',
      description: 'Catastrophic transformer failure avoided at minimal expense to the utility.',
      narrative: 'Cost of flexibility: ₹1,560 in Urja Coins. Asset replacement savings: ₹4,00,000. Customer satisfaction preserved with zero blackouts.',
      actionText: 'Complete Guided Walkthrough',
      executeAction: (_s) => {},
      statusBadge: 'NORMAL',
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      steps[nextIndex].executeAction(store);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      steps[prevIndex].executeAction(store);
    }
  };

  const handleJump = (index: number) => {
    setCurrentStepIndex(index);
    steps[index].executeAction(store);
  };

  return (
    <div className="space-y-6">
      {/* Walkthrough Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171D22] text-white p-5 rounded-2xl border border-[#2D3640] shadow-md">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Urja-Sync 10-Step Interactive Demo Walkthrough
            </h1>
            <span className="bg-[#7F9565]/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-[#7F9565]/40 font-mono">
              Step {currentStep.stepNumber} of 10
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Follow the complete workflow from duck-curve sunset to AI prediction, Knapsack optimization, and reward disbursement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="darkOutline"
            size="sm"
            onClick={() => handleJump(0)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restart Walkthrough
          </Button>
        </div>
      </div>

      {/* 10-Step Progress Stepper Bar */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1">
        {steps.map((st, i) => (
          <button
            key={i}
            onClick={() => handleJump(i)}
            className={`flex-1 min-w-[70px] py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
              currentStepIndex === i
                ? 'bg-[#7F9565] text-white border-[#7F9565] shadow-xs'
                : i < currentStepIndex
                ? 'bg-white text-[#7F9565] border-[#7F9565]/30'
                : 'bg-white/60 text-gray-400 border-gray-200'
            }`}
          >
            <span className="block text-[10px] font-mono">Step {st.stepNumber}</span>
            <span className="truncate block text-[11px]">{st.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Split Interactive View: Narration on Left, Live Grid Response on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Narration & Action Trigger */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white h-full flex flex-col justify-between border-[#E3DED2] shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#7F9565] font-bold">
                    STEP {currentStep.stepNumber} OF 10
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#191919] mt-0.5">
                    {currentStep.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#368F8A] mt-0.5">
                    {currentStep.subtitle}
                  </p>
                </div>
                <StatusBadge status={currentStep.statusBadge} />
              </div>

              <div className="p-3.5 bg-[#F5F2E9] rounded-xl border border-[#E3DED2] text-xs leading-relaxed text-[#191919]">
                <strong className="block mb-1 text-[#7F9565] uppercase text-[10px]">What is happening:</strong>
                {currentStep.description}
              </div>

              <div className="p-3.5 bg-[#171D22] text-gray-200 rounded-xl border border-[#2D3640] text-xs leading-relaxed">
                <strong className="block mb-1 text-emerald-400 uppercase text-[10px] font-mono">Technical Breakdown:</strong>
                {currentStep.narrative}
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-6 border-t border-[#E3DED2] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={currentStepIndex === steps.length - 1}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {currentStepIndex === steps.length - 1 ? 'Demo Completed' : 'Next Step'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Live Reactive Grid Telemetry */}
        <div className="lg:col-span-7">
          <Card variant="dark" className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2D3640] mb-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    LIVE RESPONSE • TR-PAN-101
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Panaji City Center DT-01 Electrical & Thermal State
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-gray-300">
                  {store.state.simulatedTime}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="p-3 bg-[#1E252C] rounded-xl border border-[#2D3640]">
                  <p className="text-[10px] text-gray-400 font-mono">LOADING</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    {store.transformers[0].loadingPercentage}%
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {store.transformers[0].currentLoadKW} kW
                  </p>
                </div>

                <div className="p-3 bg-[#1E252C] rounded-xl border border-[#2D3640]">
                  <p className="text-[10px] text-gray-400 font-mono">TOP-OIL TEMP</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    {store.transformers[0].oilTemperature}°C
                  </p>
                  <p className="text-[10px] text-gray-500">Trip: 95°C</p>
                </div>

                <div className="p-3 bg-[#1E252C] rounded-xl border border-[#2D3640]">
                  <p className="text-[10px] text-gray-400 font-mono">SOLAR ROOFTOP</p>
                  <p className="text-xl font-bold font-mono text-[#E5A23D] mt-0.5">
                    {store.state.solarRadiationPct}%
                  </p>
                  <p className="text-[10px] text-gray-500">Sunset Drop</p>
                </div>
              </div>

              <div className="min-h-[220px]">
                <LoadProfileChart capacityKW={100} isDark={true} height={220} />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#2D3640] flex items-center justify-between text-xs text-gray-400">
              <span>Dual-Engine AI active</span>
              <span className="text-emerald-400 font-bold">
                {currentStepIndex >= 7 ? '✓ Asset Burnout Prevented' : 'Monitoring Active'}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
