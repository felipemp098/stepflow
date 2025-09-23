import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 'financial' | 'operational' | 'data' | 'error' | 'success' | 'low' | 'medium' | 'high' | 'active' | 'inactive' | 'pending';

interface StatusChipProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  financial: 'chip-financial',
  operational: 'chip-operational', 
  data: 'chip-data',
  error: 'chip-error',
  success: 'chip-success',
  low: 'chip-success',
  medium: 'chip-financial',
  high: 'chip-error',
  active: 'chip-success',
  inactive: 'chip-error',
  pending: 'chip-financial',
};

export function StatusChip({ status, children, className }: StatusChipProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs px-2 py-0.5 font-medium border rounded-full',
        statusStyles[status],
        className
      )}
    >
      {children}
    </Badge>
  );
}