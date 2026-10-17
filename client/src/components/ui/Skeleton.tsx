import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'light',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        variant === 'light' ? 'bg-[#E3DED2]/60' : 'bg-[#2D3640]/70',
        className
      )}
      {...props}
    />
  );
};
