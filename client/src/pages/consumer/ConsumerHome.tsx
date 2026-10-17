import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Coins,
  Zap,
  Bell,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const ConsumerHome: React.FC = () => {
  const { user } = useAuthStore();
  const { transformers } = useSimulationStore();

  const neighborhoodTransformer =
    transformers.find((t) => t.id === 'TR-PAN-101') || transformers[0];

  return (
    <div className="space-y-4">
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#191919] tracking-tight">
            Namaste, {user?.name?.split(' ')[0] || 'Rajesh'}! 👋
          </h1>
          <p className="text-xs text-[#6B7280]">
            Panaji Urban Feeder • Smart Meter: SM-GOA-9921
          </p>
        </div>
        <Link to="/consumer/profile">
          <div className="w-9 h-9 rounded-full bg-[#7F9565] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {user?.name?.charAt(0) || 'R'}
          </div>
        </Link>
      </div>

      {/* Urja Coins Balance Hero Card */}
      <Card className="relative overflow-hidden p-5 bg-gradient-to-br from-[#171D22] to-[#1E252C] text-white border-[#2D3640] shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Urja Coins Balance
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {user?.coins || 420}
              </span>
              <span className="text-sm font-semibold text-gray-300">Coins</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ≈ ₹{((user?.coins || 420) * 3).toLocaleString('en-IN')} GED Electricity Bill Waiver
            </p>
          </div>

          <div className="p-3 bg-[#7F9565]/20 rounded-2xl border border-[#7F9565]/40 text-[#7F9565]">
            <Coins className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#2D3640] flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-semibold flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +99 Coins earned this week
          </span>
          <Link to="/consumer/rewards">
            <span className="text-xs font-bold text-white hover:text-emerald-400 transition-colors flex items-center">
              Redeem <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>
        </div>
      </Card>

      {/* Neighborhood Transformer Status Card */}
      <Card className="p-4 bg-white border-[#E3DED2]">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3DED2] mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#191919] flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-[#7F9565]" /> Neighborhood Transformer
          </span>
          <Badge
            variant={neighborhoodTransformer.status === 'CRITICAL' ? 'critical' : 'success'}
            size="sm"
          >
            {neighborhoodTransformer.status}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Local Unit:</span>
            <span className="font-semibold text-[#191919]">{neighborhoodTransformer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Current Loading:</span>
            <span
              className={`font-mono font-bold ${
                neighborhoodTransformer.loadingPercentage >= 100
                  ? 'text-[#D94F45]'
                  : 'text-[#24845B]'
              }`}
            >
              {neighborhoodTransformer.loadingPercentage}% ({neighborhoodTransformer.currentLoadKW} kW)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Grid Health:</span>
            <span className="font-semibold text-[#191919]">{neighborhoodTransformer.healthIndex}/100</span>
          </div>
        </div>
      </Card>

      {/* Active Demand Response Alert Opportunity */}
      <Card className="p-4 bg-white border-[#E56F59]/40 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E56F59]" />
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#E56F59] animate-ping" />
            <span className="text-xs font-bold text-[#D94F45] uppercase tracking-wide">
              Active Peak Flexibility Opportunity
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#7F9565] bg-[#7F9565]/10 px-2 py-0.5 rounded-full">
            +60 Coins
          </span>
        </div>

        <p className="text-sm font-bold text-[#191919] mt-2">
          Pause Water Heater for 45 Mins
        </p>
        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
          Help prevent evening peak overload on Panaji City Center DT-01. Earn 60 Urja Coins instantly.
        </p>

        <div className="mt-3 flex items-center space-x-2">
          <Link to="/consumer/alerts" className="flex-1">
            <Button variant="coral" size="sm" className="w-full">
              Review & Accept Alert
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/consumer/energy">
          <Card className="p-3.5 bg-white text-center hover:bg-[#F5F2E9]/50 transition-colors">
            <div className="p-2 bg-[#7F9565]/10 text-[#7F9565] rounded-xl w-fit mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#191919]">Smart Appliances</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">3 Connected</p>
          </Card>
        </Link>

        <Link to="/consumer/rewards">
          <Card className="p-3.5 bg-white text-center hover:bg-[#F5F2E9]/50 transition-colors">
            <div className="p-2 bg-[#368F8A]/10 text-[#368F8A] rounded-xl w-fit mx-auto mb-2">
              <Coins className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#191919]">Rewards Ledger</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Redeem Vouchers</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};
