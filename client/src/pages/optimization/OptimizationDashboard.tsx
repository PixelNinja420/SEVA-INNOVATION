import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { api } from '@/services/api';
import { OptimizationResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import {
  Target,
  Zap,
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const OptimizationDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { transformers, applyKnapsackMitigation } = useSimulationStore();

  const defaultTrId = searchParams.get('transformerId') || 'TR-PAN-101';
  const [selectedTrId, setSelectedTrId] = useState(defaultTrId);
  const [targetReductionKW, setTargetReductionKW] = useState<number>(17.4);
  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

  const selectedTransformer =
    transformers.find((t) => t.id === selectedTrId) || transformers[0];

  const handleSolve = async () => {
    setIsSolving(true);
    setIsDeployed(false);
    try {
      const res = await api.runOptimization(selectedTrId, targetReductionKW);
      setResult(res);
    } catch {
      // Handled in api fallback
    } finally {
      setIsSolving(false);
    }
  };

  React.useEffect(() => {
    handleSolve();
  }, [selectedTrId]);

  const handleDeployCampaign = async () => {
    if (!result) return;
    try {
      await api.createCampaign({
        title: `Dynamic DR: ${selectedTransformer.name} (${targetReductionKW} kW)`,
        transformerId: selectedTransformer.id,
        transformerName: selectedTransformer.name,
        targetReductionKW,
        totalCoinsAllocated: result.totalRewardCostCoins,
      });
      applyKnapsackMitigation();
      setIsDeployed(true);
    } catch {
      // Fallback
      applyKnapsackMitigation();
      setIsDeployed(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Mathematical Formulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              0/1 Knapsack Demand Response Optimizer
            </h1>
            <span className="bg-[#7F9565]/20 text-[#6B7F52] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#7F9565]/40 uppercase tracking-wide">
              DUAL ENGINE CORE
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Solves minimal-cost appliance curtailment to guarantee transformer loading drops below critical threshold
          </p>
        </div>

        {/* Quick Test Scenario Pill */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTargetReductionKW(17.4);
            setSelectedTrId('TR-PAN-101');
            handleSolve();
          }}
          className="text-xs"
        >
          Load 17.4 kW Test Scenario
        </Button>
      </div>

      {/* Solver Inputs Configuration Bar */}
      <Card className="p-5 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-[#191919] mb-1.5">
              Target Distribution Transformer
            </label>
            <select
              value={selectedTrId}
              onChange={(e) => setSelectedTrId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E3DED2] bg-white text-xs font-semibold text-[#191919] focus:outline-none"
            >
              {transformers.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name} ({tr.code}) • {tr.currentLoadKW}/{tr.capacityKVA} kVA ({tr.loadingPercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-[#191919] mb-1.5">
              Required Load Reduction Target (kW)
            </label>
            <Input
              type="number"
              step="0.5"
              min="1"
              max="100"
              value={targetReductionKW}
              onChange={(e) => setTargetReductionKW(parseFloat(e.target.value) || 0)}
              rightIcon={<span className="text-xs text-gray-500 font-mono">kW</span>}
            />
          </div>

          <div className="md:col-span-3">
            <Button
              variant="teal"
              className="w-full h-10"
              onClick={handleSolve}
              isLoading={isSolving}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Solve 0/1 Knapsack
            </Button>
          </div>
        </div>
      </Card>

      {/* Optimization Summary KPIs */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              Required Target
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#191919] mt-1">
              {result.targetReductionKW} kW
            </p>
            <p className="text-xs text-[#6B7280]">To prevent trip</p>
          </Card>

          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              Achieved Shedding
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#24845B] mt-1">
              {result.achievedReductionKW} kW
            </p>
            <p className="text-xs text-[#24845B] font-semibold">
              +{parseFloat((result.achievedReductionKW - result.targetReductionKW).toFixed(1))} kW margin
            </p>
          </Card>

          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              Total Reward Cost
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#7F9565] mt-1">
              {result.totalRewardCostCoins} Coins
            </p>
            <p className="text-xs text-[#6B7280]">Approx. ₹{(result.totalRewardCostCoins * 3).toLocaleString('en-IN')}</p>
          </Card>

          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              Consumers Selected
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#368F8A] mt-1">
              {result.selectedConsumersCount} / {result.totalCandidatesCount}
            </p>
            <p className="text-xs text-[#6B7280]">Minimal subset</p>
          </Card>
        </div>
      )}

      {/* Infeasibility Banner if Applicable */}
      {result?.isInfeasible && (
        <div className="p-4 rounded-xl bg-[#D94F45]/10 border border-[#D94F45]/30 flex items-center space-x-3 text-xs text-[#D94F45]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Infeasibility Warning: Insufficient Flexible Load</p>
            <p className="text-[#D94F45]/80 mt-0.5">
              The available enrolled flexible appliance pool cannot satisfy {targetReductionKW} kW. Consider dispatching BESS batteries or alerting feeder operators.
            </p>
          </div>
        </div>
      )}

      {/* Deployment Action Bar */}
      {result && !result.isInfeasible && (
        <div className="p-4 rounded-xl bg-[#7F9565]/10 border border-[#7F9565]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-[#6B7F52]">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#24845B]" />
            <div>
              <p className="font-bold text-sm text-[#191919]">
                Optimal 0/1 Knapsack Frontier Calculated in {result.executionTimeMs} ms
              </p>
              <p className="text-[#6B7280]">
                Ready to dispatch targeted mobile demand-response notifications to {result.selectedConsumersCount} selected households.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleDeployCampaign}
            disabled={isDeployed}
            leftIcon={isDeployed ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isDeployed ? 'Dispatched to Consumers!' : 'Deploy DR Campaign Now'}
          </Button>
        </div>
      )}

      {/* Knapsack Solution Details Table */}
      {result && (
        <Card className="bg-white overflow-hidden">
          <div className="p-4 border-b border-[#E3DED2] flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#191919]">
              Appliances Candidates & Knapsack Selection Roster
            </h3>
            <span className="text-xs font-mono text-gray-500">
              Solver: {result.solverType}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Selected</TableHead>
                <TableHead>Consumer</TableHead>
                <TableHead>Appliance</TableHead>
                <TableHead>Flexible Load</TableHead>
                <TableHead>Urja Coins Cost</TableHead>
                <TableHead>Efficiency Ratio (kW/Coin)</TableHead>
                <TableHead>Selection Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={item.selected ? 'bg-[#7F9565]/5 font-medium' : 'opacity-60'}
                >
                  <TableCell>
                    {item.selected ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#24845B]/15 text-[#24845B]">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> SELECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-500">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> EXCLUDED
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-[#191919]">{item.consumerName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{item.consumerNumber}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold">{item.applianceName}</span>
                    <div className="text-[10px] text-gray-500 uppercase">{item.applianceType}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-[#191919]">
                    {item.flexibleLoadKW} kW
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-[#7F9565]">
                    {item.rewardCostCoins} Coins
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">
                    {item.ratioKWPerCoin}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs">
                    {item.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
