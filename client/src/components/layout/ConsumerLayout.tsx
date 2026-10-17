import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Home, Bell, Coins, Activity, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConsumerLayout: React.FC = () => {
  const { user } = useAuthStore();

  const navTabs = [
    { name: 'Home', to: '/consumer/home', icon: Home },
    { name: 'Alerts', to: '/consumer/alerts', icon: Bell, badge: '1' },
    { name: 'Rewards', to: '/consumer/rewards', icon: Coins },
    { name: 'Energy', to: '/consumer/energy', icon: Activity },
    { name: 'Profile', to: '/consumer/profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F2E9] pb-20">
      {/* PWA Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E3DED2] bg-white/95 px-4 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171D22] text-[#7F9565]">
            <Zap className="h-4 w-4 fill-[#368F8A] text-[#7F9565]" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            <span className="text-[#7F9565]">Urja</span>
            <span className="text-[#368F8A]">-Sync</span>
          </span>
        </div>

        {/* Coins indicator badge */}
        <div className="flex items-center space-x-1.5 bg-[#7F9565]/10 px-3 py-1 rounded-full border border-[#7F9565]/30">
          <Coins className="w-3.5 h-3.5 text-[#7F9565]" />
          <span className="text-xs font-bold text-[#6B7F52]">
            {user?.coins || 420} Coins
          </span>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* PWA Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-[#E3DED2] backdrop-blur-md max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-1.5 relative transition-colors',
                  isActive
                    ? 'text-[#7F9565] font-semibold'
                    : 'text-[#6B7280] hover:text-[#191919]'
                )
              }
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#E56F59] text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
