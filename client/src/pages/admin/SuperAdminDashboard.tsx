import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Users,
  Settings,
  Cpu,
  Zap,
  Building,
  Coins,
  Activity,
  CheckCircle2,
  Server,
  Database,
  Radio,
  FileText,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">
              Super Admin Console
            </h1>
            <span className="bg-[#E56F59]/20 text-[#E56F59] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E56F59]/40 uppercase tracking-wide">
              SYSTEM PRIVILEGED
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Multi-DISCOM governance, infrastructure parameters, and Urja Coins monetary policy
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/config">
            <Button variant="primary" size="sm" leftIcon={<Settings className="w-4 h-4" />} >
              System Parameters
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard label="DISCOMs" value="1" unit="GED" icon={<Building className="w-4 h-4" />} />
        <KPICard label="Regions" value="3" unit="active" icon={<ShieldCheck className="w-4 h-4" />} />
        <KPICard label="Transformers" value="328" unit="monitored" icon={<Zap className="w-4 h-4" />} />
        <KPICard label="At Risk" value="3" unit="critical" highlightColor="critical" icon={<Activity className="w-4 h-4 text-[#D94F45]" />} />
        <KPICard label="Active DR" value="2" unit="campaigns" icon={<Activity className="w-4 h-4 text-[#368F8A]" />} />
        <KPICard label="Enrolled" value="1,420" unit="consumers" icon={<Users className="w-4 h-4 text-[#7F9565]" />} />
        <KPICard label="Coins Issued" value="48.5K" unit="Urja Coins" highlightColor="teal" icon={<Coins className="w-4 h-4 text-[#368F8A]" />} />
      </div>

      {/* System Infrastructure Health Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">
                Platform Health & Ingestion Pipeline
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>MQTT Broker</span>
                  <Radio className="w-4 h-4 text-[#24845B]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Connected</p>
                <p className="text-[11px] text-[#24845B] mt-0.5 font-semibold">1,240 msg/sec</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>LightGBM Engine</span>
                  <Cpu className="w-4 h-4 text-[#368F8A]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Online</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Latency: 14ms</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>0/1 Knapsack Solver</span>
                  <Zap className="w-4 h-4 text-[#7F9565]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Active</p>
                <p className="text-[11px] text-gray-500 mt-0.5">DP Solver 4.8ms</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>PostgreSQL / Redis</span>
                  <Database className="w-4 h-4 text-[#24845B]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Healthy</p>
                <p className="text-[11px] text-gray-500 mt-0.5">18ms pool</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>Consumer SMS / Push</span>
                  <Radio className="w-4 h-4 text-[#7F9565]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Ready</p>
                <p className="text-[11px] text-gray-500 mt-0.5">WhatsApp Twilio</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F2E9] border border-[#E3DED2]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>Audit Trail</span>
                  <FileText className="w-4 h-4 text-[#368F8A]" />
                </div>
                <p className="text-lg font-bold font-mono text-[#191919]">Immutable</p>
                <p className="text-[11px] text-gray-500 mt-0.5">SHA-256 logged</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Administrator Actions */}
        <div className="lg:col-span-4">
          <Card className="p-5 bg-white h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base text-[#191919]">Administrative Tools</CardTitle>
            </CardHeader>

            <div className="space-y-2.5 my-auto">
              <Link to="/admin/users" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Users className="w-4 h-4 mr-2 text-[#7F9565]" />
                  User & Role Permissions Management
                </Button>
              </Link>
              <Link to="/admin/config" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Settings className="w-4 h-4 mr-2 text-[#368F8A]" />
                  Grid Alert Thresholds & Coins Tariff
                </Button>
              </Link>
              <Link to="/simulation" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Cpu className="w-4 h-4 mr-2 text-[#E56F59]" />
                  Simulation Engine Diagnostics
                </Button>
              </Link>
              <Link to="/audit-logs" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <FileText className="w-4 h-4 mr-2 text-gray-600" />
                  View Regulatory Audit Logs
                </Button>
              </Link>
            </div>

            <div className="pt-3 border-t border-[#E3DED2] text-[11px] text-[#6B7280]">
              Authorized for DISCOM Chief Engineers & System Administrators only.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
