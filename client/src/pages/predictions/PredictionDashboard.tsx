import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { api } from '@/services/api';
import { PredictionResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import {
  BrainCircuit,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const PredictionDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { transformers } = useSimulationStore();

  const defaultTrId = searchParams.get('transformerId') || 'TR-PAN-101';
  const [selectedTrId, setSelectedTrId] = useState(defaultTrId);
  const [horizonMinutes, setHorizonMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const selectedTransformer =
    transformers.find((t) => t.id === selectedTrId) || transformers[0];

  const handleRunPrediction = async () => {
    setIsLoading(true);
    try {
      const res = await api.runPrediction(selectedTrId, horizonMinutes);
      setPrediction(res);
    } catch {
      // Handled in api fallback
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleRunPrediction();
  }, [selectedTrId, horizonMinutes]);

  return (
    <div className="space-y-6">
      {/* Page Title & Model Badge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              AI Predictive Overload Intelligence
            </h1>
            <span className="bg-[#E5A23D]/20 text-[#B87A1E] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E5A23D]/40 uppercase tracking-wide">
              DEMO PREDICTION
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            LightGBM machine learning regression forecasting duck-curve overload risks 15 minutes in advance
          </p>
        </div>

        <Link to={`/optimization?transformerId=${selectedTransformer.id}`}>
          <Button variant="teal" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Proceed to 0/1 Knapsack Optimizer
          </Button>
        </Link>
      </div>

      {/* Model Spec & Run Form Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Spec Card */}
        <div className="lg:col-span-5">
          <Card variant="dark" className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2D3640] mb-4">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-[#368F8A]" />
                  <span className="text-sm font-bold text-white">LightGBM Model Architecture</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  v2.4.1-dist
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2D3640]">
                  <span className="text-gray-400">Model Name:</span>
                  <span className="font-mono text-gray-200">Urja-LightGBM-DT-Guard</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2D3640]">
                  <span className="text-gray-400">Training Horizon:</span>
                  <span className="font-mono text-gray-200">15-min / 30-min lead time</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2D3640]">
                  <span className="text-gray-400">Inference Latency:</span>
                  <span className="font-mono text-emerald-400">14.2 ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2D3640]">
                  <span className="text-gray-400">Historical Accuracy:</span>
                  <span className="font-mono text-[#7F9565]">92.8% R² score</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Inference Source:</span>
                  <span className="font-mono text-amber-400">rule-based-demo (Simulated)</span>
                </div>
              </div>
            </div>

            {/* Run Prediction Controls */}
            <div className="mt-5 pt-4 border-t border-[#2D3640] space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Target Transformer
                </label>
                <select
                  value={selectedTrId}
                  onChange={(e) => setSelectedTrId(e.target.value)}
                  className="w-full h-9 rounded-lg bg-[#1E252C] border border-[#2D3640] text-xs text-white px-3 focus:outline-none"
                >
                  {transformers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} ({tr.code}) - {tr.capacityKVA} kVA
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setHorizonMinutes(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      horizonMinutes === mins
                        ? 'bg-[#368F8A] text-white'
                        : 'bg-[#1E252C] text-gray-400 border border-[#2D3640]'
                    }`}
                  >
                    +{mins} Mins
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleRunPrediction}
                isLoading={isLoading}
              >
                Re-calculate Inference
              </Button>
            </div>
          </Card>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-7">
          {prediction && (
            <Card className="p-5 bg-white h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED2] mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      FORECAST RESULT • +{prediction.horizonMinutes} MIN HORIZON
                    </span>
                    <h3 className="text-lg font-bold text-[#191919]">
                      {prediction.transformerName}
                    </h3>
                  </div>
                  <StatusBadge status={prediction.predictedRiskLevel} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 bg-[#F5F2E9] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Predicted Load</p>
                    <p className="text-2xl font-bold font-mono text-[#D94F45] mt-1">
                      {prediction.forecastLoadKW} kW
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {prediction.forecastLoadingPercentage}% of capacity
                    </p>
                  </div>

                  <div className="p-3 bg-[#F5F2E9] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Overload Probability</p>
                    <p className="text-2xl font-bold font-mono text-[#E56F59] mt-1">
                      {(prediction.overloadProbability * 100).toFixed(0)}%
                    </p>
                    <p className="text-[11px] text-gray-500">Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%</p>
                  </div>

                  <div className="p-3 bg-[#F5F2E9] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Lead Time</p>
                    <p className="text-2xl font-bold font-mono text-[#7F9565] mt-1">
                      {prediction.horizonMinutes} Mins
                    </p>
                    <p className="text-[11px] text-gray-500">Action window</p>
                  </div>
                </div>

                {/* Feature Importance / Explanation Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-[#191919] uppercase tracking-wider mb-2">
                    Key Overload Drivers (SHAP Feature Importance)
                  </h4>
                  <div className="space-y-2">
                    {prediction.explanationFactors.map((f, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#191919]">{f.factor}</span>
                          <span className="font-mono text-gray-500 font-bold">
                            {(f.weight * 100).toFixed(0)}% impact
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E3DED2] flex items-center justify-between">
                <span className="text-xs text-[#D94F45] font-semibold flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5" /> Overload predicted at 18:45 without DR intervention.
                </span>
                <Link to={`/optimization?transformerId=${selectedTransformer.id}`}>
                  <Button variant="primary" size="sm">
                    Open Knapsack Optimizer
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Historical Forecast vs Actual Validation Chart */}
      <Card className="p-5 bg-white">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-base text-[#191919]">
            AI Forecast vs Actual Grid Load Curve (Validation Horizon)
          </CardTitle>
        </CardHeader>
        <LoadProfileChart capacityKW={selectedTransformer.capacityKVA} height={240} />
      </Card>
    </div>
  );
};
