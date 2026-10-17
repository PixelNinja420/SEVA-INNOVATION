import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#191919]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-[#191919] transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#7F9565]/40 focus:border-[#7F9565]',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error ? 'border-[#D94F45] focus:ring-[#D94F45]/30' : 'border-[#E3DED2]',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B7280]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-[#D94F45] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6B7280]">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
