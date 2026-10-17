import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadProfileChart } from '@/components/charts/LoadProfileChart';
import { Zap, Power, BatteryCharging, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface ApplianceItem {
  id: string;
  name: string;
  type: string;
  powerKW: number;
  isFlexible: boolean;
  status: 'ONLINE' | 'STANDBY' | 'SHED';
}

export const ConsumerEnergy: React.FC = () => {
  const [appliances, setAppliances] = useState<ApplianceItem[]>([
    { id: '1', name: 'Nexon EV Fast Charger', type: 'EV_CHARGER', powerKW: 3.3, isFlexible: true, status: 'ONLINE' },
    { id: '2', name: 'Instant Geyser 25L', type: 'WATER_HEATER', powerKW: 2.0, isFlexible: true, status: 'SHED' },
    { id: '3', name: 'Master Bedroom Inverter AC', type: 'AIR_CONDITIONER', powerKW: 1.8, isFlexible: true, status: 'ONLINE' },
    { id: '4', name: 'Refrigerator & Lighting', type: 'CRITICAL_LOAD', powerKW: 0.4, isFlexible: false, status: 'ONLINE' },
  ]);

  const toggleFlexibility = (id: string) => {
    setAppliances(
      appliances.map((app) =>
        app.id === id ? { ...app, isFlexible: !app.isFlexible } : app
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#191919]">
          Home Energy & Smart Appliances
        </h1>
        <p className="text-xs text-[#6B7280]">
          Manage automated flexible load shedding preferences for your home
        </p>
      </div>

      {/* Hourly Energy Consumption vs Baseline */}
      <Card className="p-4 bg-white">
        <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider mb-2">
          Today's Hourly Consumption Curve (kW)
        </h3>
        <LoadProfileChart capacityKW={8} height={200} showForecast={false} />
      </Card>

      {/* Flexible Appliances Toggles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider">
          Enrolled Smart Appliances
        </h3>

        <div className="space-y-2">
          {appliances.map((app) => (
            <Card key={app.id} className="p-3 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl ${
                    app.status === 'SHED'
                      ? 'bg-[#E5A23D]/15 text-[#E5A23D]'
                      : 'bg-[#7F9565]/15 text-[#7F9565]'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#191919]">{app.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {app.powerKW} kW • {app.status === 'SHED' ? 'Currently Shed (Saving)' : 'Active'}
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleFlexibility(app.id)}
                  disabled={!app.isFlexible && app.type === 'CRITICAL_LOAD'}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    app.isFlexible
                      ? 'bg-[#7F9565] text-white border-[#7F9565]'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  {app.isFlexible ? 'Flexible ✓' : 'Fixed'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
