import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { StatusChip, StatusType } from './StatusChip';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  title: string;
  message: string;
  severity: StatusType;
  className?: string;
}

const severityBorders: Record<StatusType, string> = {
  financial: 'border-l-financial',
  operational: 'border-l-operational',
  data: 'border-l-data',
  error: 'border-l-error',
  success: 'border-l-success',
  low: 'border-l-success',
  medium: 'border-l-financial',
  high: 'border-l-error',
  active: 'border-l-success',
  inactive: 'border-l-error',
  pending: 'border-l-financial',
};

export function AlertCard({ title, message, severity, className }: AlertCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <Card className={cn(
        'shadow-card-md hover:shadow-card-lg transition-shadow duration-sm border-l-2',
        severityBorders[severity],
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-fg-1">{title}</h3>
                <StatusChip status={severity}>
                  {severity === 'low' ? 'Baixa' : 
                   severity === 'medium' ? 'Média' : 
                   severity === 'high' ? 'Alta' : severity}
                </StatusChip>
              </div>
              <p className="text-sm text-fg-2">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}