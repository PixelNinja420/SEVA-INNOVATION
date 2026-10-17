import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#191919]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#191919] placeholder:text-gray-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#7F9565]/40 focus:border-[#7F9565]',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-[#D94F45] focus:ring-[#D94F45]/30' : 'border-[#E3DED2]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#D94F45] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6B7280]">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
