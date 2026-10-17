import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Map,
  Cpu,
  Zap,
  BrainCircuit,
  Target,
  Megaphone,
  Coins,
  BarChart3,
  Calculator,
  Battery,
  Settings,
  FileText,
  PlayCircle,
  Home,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuthStore();
  const isConsumer = user?.role === 'CONSUMER';

  // Navigation Items for Grid Operators, Admins & Engineers
  const operatorNavItems = [
    { name: 'Operator Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Grid Map', to: '/map', icon: Map },
    { name: 'Simulation Lab', to: '/simulation', icon: Cpu, badge: 'Live' },
    { name: 'Transformers', to: '/transformers', icon: Zap },
    { name: 'AI Predictions', to: '/predictions', icon: BrainCircuit },
    { name: 'Knapsack Optimizer', to: '/optimization', icon: Target },
    { name: 'DR Campaigns', to: '/campaigns', icon: Megaphone },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'ROI Calculator', to: '/financial', icon: Calculator },
    { name: 'Battery & V2G', to: '/batteries', icon: Battery },
    { name: 'Guided Walkthrough', to: '/demo', icon: PlayCircle, badge: 'Demo' },
    { name: 'DISCOM Overview', to: '/discom', icon: ShieldCheck },
    { name: 'System Admin', to: '/admin', icon: Settings },
    { name: 'Audit Logs', to: '/audit-logs', icon: FileText },
  ];

  // Consumer Nav Items
  const consumerNavItems = [
    { name: 'Consumer Home', to: '/consumer/home', icon: Home },
    { name: 'Grid Alerts', to: '/consumer/alerts', icon: Megaphone, badge: 'Alert' },
    { name: 'Urja Rewards', to: '/consumer/rewards', icon: Coins },
    { name: 'Energy & Appliances', to: '/consumer/energy', icon: Zap },
    { name: 'Profile & Settings', to: '/consumer/profile', icon: Settings },
  ];

  const itemsToRender = isConsumer ? consumerNavItems : operatorNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E3DED2] bg-white transition-all duration-300 lg:static',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E3DED2] px-4">
          <NavLink
            to="/"
            className="flex items-center space-x-2.5 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#171D22] text-[#7F9565] shadow-xs">
              <Zap className="h-5 w-5 fill-[#368F8A] text-[#7F9565]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight leading-none">
                  <span className="text-[#7F9565]">Urja</span>
                  <span className="text-[#368F8A]">-Sync</span>
                </span>
                <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase mt-0.5">
                  DT Protection Platform
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#F5F2E9] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {itemsToRender.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#7F9565]/15 text-[#6B7F52] border border-[#7F9565]/30 shadow-xs'
                    : 'text-[#6B7280] hover:bg-[#F5F2E9] hover:text-[#191919]'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  collapsed ? 'mx-auto' : 'mr-3'
                )}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase',
                    item.badge === 'Live'
                      ? 'bg-[#368F8A]/20 text-[#368F8A]'
                      : item.badge === 'Alert'
                      ? 'bg-[#E56F59]/20 text-[#E56F59] animate-pulse'
                      : 'bg-[#7F9565]/20 text-[#7F9565]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom Quick-Switch / Version badge */}
        {!collapsed && (
          <div className="p-3 border-t border-[#E3DED2] bg-[#F5F2E9]/60">
            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Goa Smart Grid Demo</span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E3DED2]">
                v1.0.0
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
