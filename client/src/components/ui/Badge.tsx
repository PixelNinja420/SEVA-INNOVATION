import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none tracking-wide',
  {
    variants: {
      variant: {
        success: 'bg-[#24845B]/15 text-[#24845B] border border-[#24845B]/30',
        warning: 'bg-[#E5A23D]/15 text-[#B87A1E] border border-[#E5A23D]/30',
        critical: 'bg-[#D94F45]/15 text-[#D94F45] border border-[#D94F45]/30',
        info: 'bg-[#368F8A]/15 text-[#368F8A] border border-[#368F8A]/30',
        primary: 'bg-[#7F9565]/15 text-[#6B7F52] border border-[#7F9565]/30',
        outline: 'border border-[#E3DED2] text-[#6B7280]',
        dark: 'bg-[#1E252C] text-gray-300 border border-[#2D3640]',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.2',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'info',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}) => {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0',
            variant === 'success' && 'bg-[#24845B]',
            variant === 'warning' && 'bg-[#E5A23D]',
            variant === 'critical' && 'bg-[#D94F45] animate-pulse',
            variant === 'info' && 'bg-[#368F8A]',
            variant === 'primary' && 'bg-[#7F9565]',
            (!variant || variant === 'outline' || variant === 'dark') && 'bg-gray-400'
          )}
        />
      )}
      {children}
    </div>
  );
};
