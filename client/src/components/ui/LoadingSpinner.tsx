import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'teal' | 'coral' | 'white' | 'muted';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-[#7F9565]',
    teal: 'text-[#368F8A]',
    coral: 'text-[#E56F59]',
    white: 'text-white',
    muted: 'text-[#6B7280]',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size], variantClasses[variant])} />
      {text && <p className="text-xs text-[#6B7280] font-medium">{text}</p>}
    </div>
  );
};
