import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function KpiCard({ title, value, icon: Icon, className, trend }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <Card className={cn('shadow-card-md hover:shadow-card-lg transition-shadow duration-sm', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-fg-3 font-medium">{title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-fg-1">{value}</span>
                {trend && (
                  <span className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-error'
                  )}>
                    {trend.isPositive ? '+' : ''}{trend.value}
                  </span>
                )}
              </div>
            </div>
            {Icon && (
              <div className="p-2 bg-surface-1 rounded-lg">
                <Icon className="h-5 w-5 text-fg-3" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}