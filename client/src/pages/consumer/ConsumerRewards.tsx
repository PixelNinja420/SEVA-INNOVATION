import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MOCK_REWARD_TRANSACTIONS } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Coins, TrendingUp, Tag, Gift, CheckCircle2, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const ConsumerRewards: React.FC = () => {
  const { user } = useAuthStore();
  const coinsBalance = user?.coins || 420;

  const redemptionCatalog = [
    { id: 'cat-1', title: '₹150 GED Electricity Bill Waiver', costCoins: 50, tag: 'Discom Credit' },
    { id: 'cat-2', title: '₹300 Fast EV Charging Credit', costCoins: 100, tag: 'EV Mobility' },
    { id: 'cat-3', title: '₹600 Solar Rooftop Netting Bonus', costCoins: 200, tag: 'Green Credit' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#191919]">
          Urja Coins Rewards Ledger
        </h1>
        <p className="text-xs text-[#6B7280]">
          Earned through grid flexibility, peak shedding, and solar self-consumption
        </p>
      </div>

      {/* Balance Card */}
      <Card className="p-5 bg-[#171D22] text-white border-[#2D3640] shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              Total Active Balance
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                {coinsBalance}
              </span>
              <span className="text-sm font-semibold text-gray-300">Urja Coins</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              1 Urja Coin ≈ ₹3.00 Discom bill deduction
            </p>
          </div>
          <div className="p-3 bg-[#7F9565]/20 rounded-2xl text-[#7F9565]">
            <Coins className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#2D3640] text-xs">
          <div>
            <span className="text-gray-400">Earned This Month:</span>
            <p className="font-bold text-white font-mono mt-0.5">+240 Coins</p>
          </div>
          <div>
            <span className="text-gray-400">Total Lifetime Savings:</span>
            <p className="font-bold text-emerald-400 font-mono mt-0.5">₹2,840</p>
          </div>
        </div>
      </Card>

      {/* Prototype Rewards Disclaimer */}
      <div className="p-3 bg-[#368F8A]/10 border border-[#368F8A]/30 rounded-xl flex items-center space-x-2.5 text-xs text-[#368F8A]">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <p>
          <strong>Prototype Disclaimer:</strong> Urja Coins are synthetic reward points demonstrated for Indian DISCOM demand response trials.
        </p>
      </div>

      {/* Redeem Catalog */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider">
          Redeem Vouchers & Bill Credits
        </h3>
        <div className="space-y-2">
          {redemptionCatalog.map((item) => (
            <Card key={item.id} className="p-3 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#368F8A] bg-[#368F8A]/10 px-1.5 py-0.2 rounded">
                  {item.tag}
                </span>
                <p className="text-xs font-bold text-[#191919] mt-1">{item.title}</p>
                <p className="text-[11px] font-mono text-[#7F9565] font-semibold">
                  Cost: {item.costCoins} Coins
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8">
                Redeem
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider">
          Recent Activity & Ledger History
        </h3>
        <div className="space-y-2">
          {MOCK_REWARD_TRANSACTIONS.map((tx) => (
            <Card key={tx.id} className="p-3 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      tx.amount > 0 ? 'bg-[#24845B]/15 text-[#24845B]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191919]">{tx.description}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{tx.timestamp}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold ${
                    tx.amount > 0 ? 'text-[#24845B]' : 'text-gray-500'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Coins
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
