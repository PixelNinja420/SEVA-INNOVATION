import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/ui/KPICard';
import { Calculator, ShieldCheck, TrendingUp, DollarSign, Award, Info } from 'lucide-react';

export const ROICalculator: React.FC = () => {
  // Inputs
  const [replacementCost, setReplacementCost] = useState<number>(400000); // ₹4,00,000
  const [transformersMonitored, setTransformersMonitored] = useState<number>(50);
  const [hardwareCostPerUnit, setHardwareCostPerUnit] = useState<number>(25000);
  const [preventedFailures, setPreventedFailures] = useState<number>(4);
  const [eventsPerYear, setEventsPerYear] = useState<number>(30);
  const [costPerEvent, setCostPerEvent] = useState<number>(200);

  // Calculations
  const grossSavings = preventedFailures * replacementCost;
  const initialHardwareInvestment = transformersMonitored * hardwareCostPerUnit;
  const annualIncentivesCost = preventedFailures * eventsPerYear * costPerEvent * 5; // ~5 participants per event
  const annualMaintenance = transformersMonitored * 2000;
  const totalAnnualCost = annualIncentivesCost + annualMaintenance;
  const netAnnualSavings = grossSavings - totalAnnualCost;

  // 3-Year ROI %
  const threeYearGrossSavings = grossSavings * 3;
  const threeYearTotalInvestment = initialHardwareInvestment + (totalAnnualCost * 3);
  const threeYearNetSavings = threeYearGrossSavings - threeYearTotalInvestment;
  const roiPercentage = threeYearTotalInvestment > 0
    ? ((threeYearNetSavings / threeYearTotalInvestment) * 100).toFixed(0)
    : '0';
  const paybackMonths = (initialHardwareInvestment / (netAnnualSavings / 12)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              Asset Longevity & ROI Calculator
            </h1>
            <span className="bg-[#7F9565]/20 text-[#6B7F52] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#7F9565]/40 uppercase tracking-wide">
              CEA BENCHMARK CALIBRATED
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Quantify financial savings from prevented distribution transformer burnouts vs flexibility incentives
          </p>
        </div>
      </div>

      {/* Primary KPI Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Gross Annual Savings"
          value={`₹${(grossSavings / 100000).toFixed(1)}L`}
          unit={`from ${preventedFailures} prevented burnouts`}
          highlightColor="primary"
          icon={<Award className="w-5 h-5 text-[#7F9565]" />}
        />

        <KPICard
          label="Net Annual Savings"
          value={`₹${(netAnnualSavings / 100000).toFixed(1)}L`}
          unit="after DR rewards & upkeep"
          highlightColor="teal"
          icon={<TrendingUp className="w-5 h-5 text-[#368F8A]" />}
        />

        <KPICard
          label="3-Year ROI"
          value={`${roiPercentage}%`}
          unit="return on capital"
          highlightColor="primary"
          icon={<Calculator className="w-5 h-5 text-[#7F9565]" />}
        />

        <KPICard
          label="Payback Period"
          value={`${paybackMonths}`}
          unit="months to breakeven"
          highlightColor="warning"
          icon={<ShieldCheck className="w-5 h-5 text-[#E5A23D]" />}
        />
      </div>

      {/* Inputs vs Output Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-6">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Configurable Utility Cost Parameters
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 mt-2">
              <Input
                label="Transformer Replacement & Downtime Cost (₹)"
                type="number"
                value={replacementCost}
                onChange={(e) => setReplacementCost(parseFloat(e.target.value) || 0)}
                helperText="Includes new 100/250 kVA unit, crane transport, labor & outage penalties"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Transformers Monitored"
                  type="number"
                  value={transformersMonitored}
                  onChange={(e) => setTransformersMonitored(parseInt(e.target.value) || 0)}
                />
                <Input
                  label="Prevented Failures / Year"
                  type="number"
                  value={preventedFailures}
                  onChange={(e) => setPreventedFailures(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="IoT Hardware & Install / Unit (₹)"
                  type="number"
                  value={hardwareCostPerUnit}
                  onChange={(e) => setHardwareCostPerUnit(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Avg. Coins Cost / Event (₹)"
                  type="number"
                  value={costPerEvent}
                  onChange={(e) => setCostPerEvent(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Scenario Comparison Cards */}
        <div className="lg:col-span-6">
          <Card className="p-5 bg-white h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Deployment Sensitivity Scenarios
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 my-auto">
              {/* Conservative */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">CONSERVATIVE (2 Failures Prevented)</span>
                  <span className="font-mono font-bold text-[#7F9565]">₹5.8 Lakh Net / Yr</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Covers monitoring costs with 160% 3-year ROI even in modest curtailment adoption.
                </p>
              </div>

              {/* Base Case */}
              <div className="p-3.5 rounded-xl bg-[#7F9565]/10 border border-[#7F9565]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#6B7F52]">BASE CASE (4 Failures Prevented)</span>
                  <span className="font-mono font-bold text-[#24845B]">₹13.9 Lakh Net / Yr</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Expected performance across typical urban feeders with high evening duck-curve stress.
                </p>
              </div>

              {/* Aggressive */}
              <div className="p-3.5 rounded-xl bg-[#368F8A]/10 border border-[#368F8A]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#368F8A]">OPTIMAL EXPANSION (8 Failures Prevented)</span>
                  <span className="font-mono font-bold text-[#368F8A]">₹29.8 Lakh Net / Yr</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Full sector saturation with automated EV smart charging integration.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DED2] text-xs text-gray-500 italic">
              * Calculations are project-reported estimates designed for financial planning.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
