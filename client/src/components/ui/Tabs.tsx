import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'dark';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-1',
        variant === 'underline' && 'border-b border-[#E3DED2]',
        variant === 'pills' && 'p-1 bg-[#F5F2E9] rounded-xl border border-[#E3DED2]',
        variant === 'dark' && 'p-1 bg-[#171D22] rounded-xl border border-[#2D3640]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-white text-[#7F9565] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#191919] hover:bg-white/50'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isActive ? 'bg-[#7F9565]/15 text-[#7F9565]' : 'bg-black/10 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        if (variant === 'dark') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-[#368F8A] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150',
              isActive
                ? 'border-[#7F9565] text-[#7F9565]'
                : 'border-transparent text-[#6B7280] hover:text-[#191919] hover:border-gray-300'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-bold',
                  isActive ? 'bg-[#7F9565]/15 text-[#7F9565]' : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
