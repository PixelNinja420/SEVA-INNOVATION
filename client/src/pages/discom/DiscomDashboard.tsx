import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart';
import { Building, ShieldCheck, Zap, Activity, TrendingDown, Coins, Award } from 'lucide-react';

export const DiscomDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* DISCOM Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              Goa Electricity Department (GED) Overview
            </h1>
            <span className="bg-[#7F9565]/20 text-[#6B7F52] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#7F9565]/40 uppercase tracking-wide">
              STATE DISCOM
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Macro grid operations, peak demand curtailment, and transformer asset protection metrics
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Peak Energy Shaved"
          value="48.2"
          unit="MWh this month"
          icon={<TrendingDown className="w-5 h-5 text-[#24845B]" />}
          change={+18.4}
          changeLabel="vs last month"
        />

        <KPICard
          label="Estimated Failures Prevented"
          value="4"
          unit="transformers"
          icon={<ShieldCheck className="w-5 h-5 text-[#368F8A]" />}
          highlightColor="teal"
        />

        <KPICard
          label="Gross Asset Savings"
          value="₹16.0"
          unit="Lakhs (Est.)"
          icon={<Award className="w-5 h-5 text-[#7F9565]" />}
          highlightColor="primary"
        />

        <KPICard
          label="Flexibility Incentive Pool"
          value="₹1.45"
          unit="Lakhs disbursed"
          icon={<Coins className="w-5 h-5 text-[#E5A23D]" />}
        />
      </div>

      {/* Substation Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Substation Peak DR Target vs Achieved Curtailment (kW)
              </CardTitle>
            </CardHeader>
            <ComparisonBarChart height={260} />
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-5 bg-white h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">Substation Health Scores</CardTitle>
            </CardHeader>

            <div className="space-y-3 my-auto text-xs">
              <div className="p-3 bg-[#F5F2E9] rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#191919]">Panaji Urban 33/11kV</p>
                  <p className="text-gray-500 text-[11px]">48 Transformers • 92% Opt-in</p>
                </div>
                <span className="font-bold text-[#24845B] font-mono text-sm">94/100</span>
              </div>

              <div className="p-3 bg-[#F5F2E9] rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#191919]">Margao South 33/11kV</p>
                  <p className="text-gray-500 text-[11px]">64 Transformers • 88% Opt-in</p>
                </div>
                <span className="font-bold text-[#368F8A] font-mono text-sm">89/100</span>
              </div>

              <div className="p-3 bg-[#F5F2E9] rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#191919]">Mapusa North 33/11kV</p>
                  <p className="text-gray-500 text-[11px]">42 Transformers • 79% Opt-in</p>
                </div>
                <span className="font-bold text-[#7F9565] font-mono text-sm">91/100</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DED2] text-xs text-gray-500">
              Coordinated with Goa State Load Despatch Centre (SLDC)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
