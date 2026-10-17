import React from 'react';
import { MOCK_BATTERIES, MOCK_V2G_RESOURCES } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Battery as BatteryIcon, BatteryCharging, Zap, Car, ShieldCheck, Activity } from 'lucide-react';

export const BatteryDashboard: React.FC = () => {
  const totalBESSKW = MOCK_BATTERIES.reduce((acc, b) => acc + (b.currentOutputKW > 0 ? b.currentOutputKW : 0), 0);
  const totalV2GKW = MOCK_V2G_RESOURCES.reduce((acc, v) => acc + (v.status === 'DISCHARGING' ? v.availableFlexKW : 0), 0);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              Battery Storage (BESS) & Vehicle-to-Grid (V2G)
            </h1>
            <span className="bg-[#368F8A]/20 text-[#368F8A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#368F8A]/40 uppercase tracking-wide">
              FLEXIBILITY ASSETS
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Aggregate community battery energy storage and bidirectional EV charging for peak shaving
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="BESS Peak Discharge"
          value={`${totalBESSKW.toFixed(1)}`}
          unit="kW active"
          highlightColor="teal"
          icon={<BatteryCharging className="w-5 h-5 text-[#368F8A]" />}
        />

        <KPICard
          label="V2G Active Fleet"
          value={`${totalV2GKW.toFixed(1)}`}
          unit="kW supporting grid"
          highlightColor="primary"
          icon={<Car className="w-5 h-5 text-[#7F9565]" />}
        />

        <KPICard
          label="Connected EV Count"
          value="4"
          unit="smart EVs"
          icon={<Car className="w-5 h-5 text-[#E5A23D]" />}
        />

        <KPICard
          label="Aggregate Storage"
          value="690"
          unit="kWh capacity"
          icon={<BatteryIcon className="w-5 h-5 text-[#24845B]" />}
        />
      </div>

      {/* Community Battery Storage Units (BESS) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#191919]">
          Stationary Battery Energy Storage Systems (BESS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_BATTERIES.map((bat) => (
            <Card key={bat.id} className="p-4 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#191919]">{bat.name}</h4>
                  <p className="text-[11px] text-[#6B7280]">{bat.transformerName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    bat.status === 'DISCHARGING'
                      ? 'bg-[#E56F59]/20 text-[#E56F59]'
                      : 'bg-[#7F9565]/20 text-[#7F9565]'
                  }`}
                >
                  {bat.status}
                </span>
              </div>

              {/* State of Charge (SoC) Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-500">State of Charge (SoC)</span>
                  <span className="font-mono text-[#191919] font-bold">{bat.currentSoCPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#368F8A] rounded-full"
                    style={{ width: `${bat.currentSoCPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E3DED2] text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Capacity</span>
                  <span className="font-mono font-bold">{bat.capacityKWh} kWh</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Current Rate</span>
                  <span className="font-mono font-bold text-[#24845B]">
                    {bat.currentOutputKW > 0 ? `+${bat.currentOutputKW} kW` : `${bat.currentOutputKW} kW`}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Vehicle-to-Grid (V2G) Active EV Roster */}
      <Card className="bg-white overflow-hidden">
        <div className="p-4 border-b border-[#E3DED2] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#191919]">
            Enrolled Vehicle-to-Grid (V2G) EV Fleet
          </h3>
          <span className="text-xs font-semibold text-[#7F9565]">
            Bidirectional Inverters Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F2E9] text-[#6B7280] uppercase text-[10px]">
              <tr>
                <th className="p-3">Vehicle Model</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Battery Size</th>
                <th className="p-3">Current SoC</th>
                <th className="p-3">Min Reserved SoC</th>
                <th className="p-3">Available Flex</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DED2]">
              {MOCK_V2G_RESOURCES.map((v) => (
                <tr key={v.id} className="hover:bg-[#F5F2E9]/40">
                  <td className="p-3 font-semibold text-[#191919]">{v.vehicleModel}</td>
                  <td className="p-3 text-gray-600">{v.ownerName}</td>
                  <td className="p-3 font-mono">{v.batteryCapacityKWh} kWh</td>
                  <td className="p-3 font-mono font-bold text-[#368F8A]">{v.currentSoCPercent}%</td>
                  <td className="p-3 font-mono text-gray-500">{v.minReservedSoCPercent}%</td>
                  <td className="p-3 font-mono font-bold text-[#7F9565]">+{v.availableFlexKW} kW</td>
                  <td className="p-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        v.status === 'DISCHARGING'
                          ? 'bg-[#E56F59]/20 text-[#E56F59]'
                          : 'bg-[#24845B]/20 text-[#24845B]'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
