import React from 'react';
import { Badge } from './Badge';
import { TransformerStatus, RiskLevel, CampaignStatus } from '@/types';

interface StatusBadgeProps {
  status: TransformerStatus | RiskLevel | CampaignStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'NORMAL':
    case 'LOW':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'OPTIMAL':
      return (
        <Badge variant="success" size={size} dot className={className}>
          {normalized}
        </Badge>
      );
    case 'WATCH':
    case 'MEDIUM':
    case 'PENDING':
    case 'STANDBY':
      return (
        <Badge variant="info" size={size} dot className={className}>
          {normalized}
        </Badge>
      );
    case 'WARNING':
    case 'HIGH':
    case 'DRAFT':
      return (
        <Badge variant="warning" size={size} dot className={className}>
          {normalized}
        </Badge>
      );
    case 'CRITICAL':
    case 'OVERLOADED':
      return (
        <Badge variant="critical" size={size} dot className={className}>
          {normalized}
        </Badge>
      );
    case 'OFFLINE':
    case 'CANCELLED':
    case 'FAILED':
      return (
        <Badge variant="outline" size={size} dot className={className}>
          {normalized}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size={size} className={className}>
          {status}
        </Badge>
      );
  }
};
