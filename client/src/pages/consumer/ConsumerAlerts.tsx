import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface AlertItem {
  id: string;
  reason: string;
  appliance: string;
  reductionKW: number;
  durationMinutes: number;
  rewardCoins: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  timestamp: string;
}

export const ConsumerAlerts: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      reason: 'Panaji City Center DT-01 Evening Duck-Curve Overload Mitigation',
      appliance: 'Instant Geyser (25L Water Heater)',
      reductionKW: 2.0,
      durationMinutes: 45,
      rewardCoins: 60,
      status: 'PENDING',
      timestamp: 'Just now (18:25)',
    },
    {
      id: 'alt-2',
      reason: 'Miramar Feeder Solar Sunset Smoothing Dispatch',
      appliance: 'Nexon EV Smart Fast Charger',
      reductionKW: 3.3,
      durationMinutes: 60,
      rewardCoins: 99,
      status: 'ACCEPTED',
      timestamp: 'Today, 17:30',
    },
    {
      id: 'alt-3',
      reason: 'Grid Peak Shaving Event #42',
      appliance: 'Living Room 2.0T Inverter AC',
      reductionKW: 1.5,
      durationMinutes: 30,
      rewardCoins: 45,
      status: 'COMPLETED',
      timestamp: 'Yesterday, 19:00',
    },
  ]);

  const handleResponse = (id: string, response: 'ACCEPTED' | 'DECLINED') => {
    setAlerts(
      alerts.map((alt) => {
        if (alt.id === id) {
          if (response === 'ACCEPTED') {
            const currentCoins = user?.coins || 420;
            updateUser({ coins: currentCoins + alt.rewardCoins });
          }
          return { ...alt, status: response };
        }
        return alt;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#191919]">
          Grid Demand Response Alerts
        </h1>
        <p className="text-xs text-[#6B7280]">
          Accept requests to temporarily shed non-essential loads and earn Urja Coins
        </p>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 bg-white border ${
              alert.status === 'PENDING'
                ? 'border-[#E56F59] shadow-md'
                : 'border-[#E3DED2]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-xl ${
                    alert.status === 'PENDING'
                      ? 'bg-[#E56F59]/15 text-[#E56F59]'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#191919]">{alert.appliance}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">{alert.timestamp}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-mono text-[#7F9565] bg-[#7F9565]/10 px-2 py-0.5 rounded-full">
                  +{alert.rewardCoins} Coins
                </span>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] mt-2.5 leading-relaxed">
              {alert.reason}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E3DED2] text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Reduction</span>
                <span className="font-mono font-bold text-[#191919]">
                  {alert.reductionKW} kW
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Duration</span>
                <span className="font-mono font-bold text-[#191919]">
                  {alert.durationMinutes} Minutes
                </span>
              </div>
            </div>

            {/* Interaction Buttons for Pending Alert */}
            {alert.status === 'PENDING' ? (
              <div className="mt-3.5 pt-3 border-t border-[#E3DED2] flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleResponse(alert.id, 'DECLINED')}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleResponse(alert.id, 'ACCEPTED')}
                >
                  Accept & Earn
                </Button>
              </div>
            ) : (
              <div className="mt-3 pt-2 border-t border-[#E3DED2] flex items-center justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-bold flex items-center ${
                    alert.status === 'ACCEPTED' || alert.status === 'COMPLETED'
                      ? 'text-[#24845B]'
                      : 'text-gray-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {alert.status}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
