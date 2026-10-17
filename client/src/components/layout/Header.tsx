import React, { useState } from 'react';
import { useAuthStore, DEMO_USERS } from '@/stores/authStore';
import { useRegionStore } from '@/stores/regionStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { UserRole } from '@/types';
import {
  Bell,
  MapPin,
  Play,
  Pause,
  Clock,
  LogOut,
  ChevronDown,
  UserCheck,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const { selectedRegion, regions, setRegion } = useRegionStore();
  const { state: simState, start, pause } = useSimulationStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Transformer Overload Warning',
      desc: 'Panaji City Center DT-01 reached 98.4% load.',
      time: '2m ago',
      unread: true,
      type: 'critical',
    },
    {
      id: '2',
      title: 'Knapsack Optimization Ready',
      desc: '17.4 kW candidate pool ready for dispatch.',
      time: '6m ago',
      unread: true,
      type: 'info',
    },
    {
      id: '3',
      title: 'Sunset Duck Curve Detected',
      desc: 'Solar generation drop registered across feeder FDR-PAN-01.',
      time: '18m ago',
      unread: false,
      type: 'warning',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E3DED2] bg-white/95 px-4 lg:px-6 backdrop-blur-md">
      {/* Left section: Hamburger button + Region Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#F5F2E9] lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Region selector */}
        <div className="flex items-center space-x-2 bg-[#F5F2E9] px-3 py-1.5 rounded-lg border border-[#E3DED2]">
          <MapPin className="w-4 h-4 text-[#7F9565]" />
          <select
            value={selectedRegion.id}
            onChange={(e) => {
              const reg = regions.find((r) => r.id === e.target.value);
              if (reg) setRegion(reg);
            }}
            className="bg-transparent text-xs font-semibold text-[#191919] focus:outline-none cursor-pointer pr-1"
          >
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle section: Real-time Simulation Status Pill */}
      <div className="hidden md:flex items-center space-x-2 bg-[#171D22] text-white px-3.5 py-1.5 rounded-full border border-[#2D3640] shadow-xs">
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[#368F8A]" />
          <span className="font-semibold text-emerald-400">{simState.simulatedTime}</span>
        </div>
        <span className="text-gray-600">|</span>
        <span className="text-[11px] font-medium text-gray-300 capitalize">
          {simState.scenario.toLowerCase().replace('_', ' ')}
        </span>
        <button
          onClick={() => (simState.status === 'RUNNING' ? pause() : start())}
          className="ml-1 p-1 rounded-full hover:bg-white/10 text-white transition-colors"
          title={simState.status === 'RUNNING' ? 'Pause Simulation' : 'Start Simulation'}
        >
          {simState.status === 'RUNNING' ? (
            <Pause className="w-3 h-3 text-[#E5A23D]" />
          ) : (
            <Play className="w-3 h-3 text-[#24845B]" />
          )}
        </button>
      </div>

      {/* Right section: Notifications + Role Switcher / User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#F5F2E9] transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E56F59] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl border border-[#E3DED2] z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3DED2] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#191919]">
                  Grid Alerts & Activity
                </span>
                <span className="text-[11px] text-[#7F9565] font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-[#F5F2E9]/60 hover:bg-[#F5F2E9] transition-colors cursor-pointer border border-[#E3DED2]/50 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#191919]">{n.title}</span>
                      <span className="text-[10px] text-gray-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-lg border border-[#E3DED2] hover:bg-[#F5F2E9] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#7F9565] text-white flex items-center justify-center text-xs font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#191919] leading-tight">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[10px] text-[#368F8A] font-medium leading-none">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-xl border border-[#E3DED2] z-50">
              <div className="px-3 py-2 border-b border-[#E3DED2] mb-1">
                <p className="text-xs font-bold text-[#191919]">{user?.name}</p>
                <p className="text-[11px] text-gray-500">{user?.email}</p>
              </div>

              <div className="py-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Switch Demo Role:
                </p>
                {(
                  [
                    'GRID_OPERATOR',
                    'DISCOM_ADMIN',
                    'SUPER_ADMIN',
                    'FIELD_ENGINEER',
                    'CONSUMER',
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      loginAsRole(role);
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left rounded-md hover:bg-[#F5F2E9] text-[#191919]"
                  >
                    <span className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#7F9565]" />
                      <span>{role.replace('_', ' ')}</span>
                    </span>
                    {user?.role === role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7F9565]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-[#E3DED2]">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-[#D94F45] hover:bg-[#D94F45]/10 rounded-md font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
