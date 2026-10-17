import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number; // percentage change, e.g. +4.2 or -1.5
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'dark';
  highlightColor?: 'primary' | 'teal' | 'coral' | 'critical' | 'warning';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  change,
  changeLabel = 'vs last hour',
  trend,
  icon,
  variant = 'default',
  highlightColor,
  className,
}) => {
  const isDark = variant === 'dark';

  return (
    <Card
      variant={variant}
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md p-5',
        className
      )}
    >
      {/* Subtle top accent bar if highlighted */}
      {highlightColor && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1',
            highlightColor === 'primary' && 'bg-[#7F9565]',
            highlightColor === 'teal' && 'bg-[#368F8A]',
            highlightColor === 'coral' && 'bg-[#E56F59]',
            highlightColor === 'critical' && 'bg-[#D94F45]',
            highlightColor === 'warning' && 'bg-[#E5A23D]'
          )}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-gray-400' : 'text-[#6B7280]'
            )}
          >
            {label}
          </p>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span
              className={cn(
                'text-2xl lg:text-3xl font-bold tracking-tight',
                isDark ? 'text-white' : 'text-[#191919]'
              )}
            >
              {value}
            </span>
            {unit && (
              <span
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-gray-400' : 'text-[#6B7280]'
                )}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              'p-2.5 rounded-lg shrink-0',
              isDark
                ? 'bg-[#1E252C] text-[#368F8A] border border-[#2D3640]'
                : 'bg-[#F5F2E9] text-[#7F9565] border border-[#E3DED2]'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined || trend) && (
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-dashed border-gray-200/50 dark:border-gray-800">
          <div
            className={cn(
              'flex items-center text-xs font-semibold px-1.5 py-0.5 rounded',
              change !== undefined && change > 0
                ? 'text-[#24845B] bg-[#24845B]/10'
                : change !== undefined && change < 0
                ? 'text-[#D94F45] bg-[#D94F45]/10'
                : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
            )}
          >
            {change !== undefined && change > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : change !== undefined && change < 0 ? (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Minus className="w-3.5 h-3.5 mr-1" />
            )}
            {change !== undefined && `${change > 0 ? '+' : ''}${change}%`}
          </div>
          <span
            className={cn(
              'text-[11px]',
              isDark ? 'text-gray-400' : 'text-[#6B7280]'
            )}
          >
            {changeLabel}
          </span>
        </div>
      )}
    </Card>
  );
};
