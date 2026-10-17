import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPICard';
import { HealthDonutChart } from '@/components/charts/HealthDonutChart';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart';
import { BarChart3, Download, Calendar, Filter, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30D');

  const handleExport = () => {
    const csvContent =
      'Date,Peak_Demand_KW,Avoided_Failures,DR_Events,Coins_Distributed,CO2_Saved_kg\n2026-10-17,28400,8,34,18450,9420\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urja_grid_analytics_${timeRange}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
            Grid Analytics & Asset Performance
          </h1>
          <p className="text-sm text-[#6B7280]">
            Longitudinal telemetry analysis, peak shaving trends, and avoided failure economics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-white rounded-lg border border-[#E3DED2] p-1 text-xs">
            {['7D', '30D', '90D', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-[#7F9565] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#191919]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4 text-[#7F9565]" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Avoided Asset Failures"
          value="8"
          unit="transformers"
          highlightColor="primary"
          icon={<ShieldCheck className="w-5 h-5 text-[#7F9565]" />}
        />
        <KPICard
          label="DR Peak Shaving Events"
          value="34"
          unit="dispatches"
          highlightColor="teal"
          icon={<Zap className="w-5 h-5 text-[#368F8A]" />}
        />
        <KPICard
          label="Average Fleet Loading"
          value="71.4%"
          unit="within safety limits"
          highlightColor="warning"
          icon={<TrendingDown className="w-5 h-5 text-[#E5A23D]" />}
        />
        <KPICard
          label="Carbon Offset Estimated"
          value="9.4"
          unit="Tonnes CO₂"
          highlightColor="primary"
          icon={<ShieldCheck className="w-5 h-5 text-[#24845B]" />}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Regional Load Profile & Peak Curtailment ({timeRange})
              </CardTitle>
            </CardHeader>
            <LoadProfileChart capacityKW={100} height={260} />
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Fleet Health Categorization
              </CardTitle>
            </CardHeader>
            <HealthDonutChart height={260} />
          </Card>
        </div>
      </div>

      {/* Substation Comparison */}
      <Card className="p-5 bg-white">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-base text-[#191919]">
            Substation Demand Response Effectiveness (kW Target vs Actual)
          </CardTitle>
        </CardHeader>
        <ComparisonBarChart height={240} />
      </Card>
    </div>
  );
};
