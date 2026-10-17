import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#7F9565] hover:bg-[#6B7F52] text-white shadow-sm focus:ring-[#7F9565]/50 border border-[#7F9565]',
        teal:
          'bg-[#368F8A] hover:bg-[#2A7571] text-white shadow-sm focus:ring-[#368F8A]/50 border border-[#368F8A]',
        coral:
          'bg-[#E56F59] hover:bg-[#D05A44] text-white shadow-sm focus:ring-[#E56F59]/50 border border-[#E56F59]',
        outline:
          'border border-[#E3DED2] bg-white hover:bg-[#F5F2E9] text-[#191919] focus:ring-[#7F9565]/40 shadow-xs',
        darkOutline:
          'border border-[#2D3640] bg-[#1E252C] hover:bg-[#2D3640] text-gray-200 focus:ring-[#368F8A]/40 shadow-xs',
        ghost:
          'bg-transparent hover:bg-black/5 text-[#191919] focus:ring-[#7F9565]/30',
        darkGhost:
          'bg-transparent hover:bg-white/10 text-gray-200 focus:ring-[#368F8A]/30',
        destructive:
          'bg-[#D94F45] hover:bg-[#B73D34] text-white shadow-sm focus:ring-[#D94F45]/50 border border-[#D94F45]',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5 font-semibold',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
