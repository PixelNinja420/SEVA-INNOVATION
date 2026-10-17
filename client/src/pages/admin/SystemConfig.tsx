import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, Save, Zap, Thermometer, Coins, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SystemConfig: React.FC = () => {
  const [criticalLoadingPct, setCriticalLoadingPct] = useState('100');
  const [warningLoadingPct, setWarningLoadingPct] = useState('85');
  const [criticalOilTemp, setCriticalOilTemp] = useState('95');
  const [warningOilTemp, setWarningOilTemp] = useState('85');
  const [coinsPerKWh, setCoinsPerKWh] = useState('3.0');
  const [knapsackWeightFactor, setKnapsackWeightFactor] = useState('1.2');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
            System Configuration & Grid Thresholds
          </h1>
          <p className="text-sm text-[#6B7280]">
            Tune AI safety margins, Knapsack objective function parameters, and Urja Coins economic tariffs
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center text-xs font-bold text-[#24845B] bg-[#24845B]/15 px-3 py-1.5 rounded-lg border border-[#24845B]/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Parameters Saved & Propagated
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Thermal & Loading Limits */}
        <Card className="p-5 bg-white">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base text-[#191919] flex items-center">
              <Zap className="w-4 h-4 mr-2 text-[#7F9565]" />
              Transformer Electrical & Thermal Alert Thresholds
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Critical Loading Threshold (%)"
              type="number"
              value={criticalLoadingPct}
              onChange={(e) => setCriticalLoadingPct(e.target.value)}
              helperText="Trigger instant emergency DR optimization when reached"
            />
            <Input
              label="Warning Loading Threshold (%)"
              type="number"
              value={warningLoadingPct}
              onChange={(e) => setWarningLoadingPct(e.target.value)}
              helperText="Initiate LightGBM predictive pre-check"
            />
            <Input
              label="Critical Top-Oil Temperature (°C)"
              type="number"
              value={criticalOilTemp}
              onChange={(e) => setCriticalOilTemp(e.target.value)}
              helperText="IEEE C57.91 maximum thermal insulation trip limit"
            />
            <Input
              label="Warning Top-Oil Temperature (°C)"
              type="number"
              value={warningOilTemp}
              onChange={(e) => setWarningOilTemp(e.target.value)}
              helperText="Thermal accumulation warning boundary"
            />
          </div>
        </Card>

        {/* Urja Coins Monetary Policy */}
        <Card className="p-5 bg-white">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base text-[#191919] flex items-center">
              <Coins className="w-4 h-4 mr-2 text-[#368F8A]" />
              Urja Coins Tariff & Knapsack Weights
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Coins Reward Conversion Rate (₹ / Coin)"
              type="number"
              step="0.1"
              value={coinsPerKWh}
              onChange={(e) => setCoinsPerKWh(e.target.value)}
              helperText="Credit applied on electricity bill per Urja Coin redeemed"
            />
            <Input
              label="0/1 Knapsack Priority Weight Factor"
              type="number"
              step="0.05"
              value={knapsackWeightFactor}
              onChange={(e) => setKnapsackWeightFactor(e.target.value)}
              helperText="Preference multiplier for fast-responding smart EV chargers"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="md" type="submit" leftIcon={<Save className="w-4 h-4" />}>
            Save Grid Parameters
          </Button>
        </div>
      </form>
    </div>
  );
};
