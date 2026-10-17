import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#191919]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#6B7280] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#191919] placeholder:text-gray-400 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#7F9565]/40 focus:border-[#7F9565]',
              'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error ? 'border-[#D94F45] focus:ring-[#D94F45]/30' : 'border-[#E3DED2]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#6B7280] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#D94F45] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6B7280]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
