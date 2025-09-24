import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  } | 'up' | 'down';
  color?: 'green' | 'blue' | 'red' | 'orange' | 'purple';
}

export function KpiCard({ title, value, description, icon: Icon, className, trend, color = 'blue' }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <Card className={cn('shadow-card-md hover:shadow-card-lg transition-shadow duration-sm h-full', className)}>
        <CardContent className="p-6 h-full flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm text-fg-3 font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-fg-1">{value}</span>
              {trend && (
                <span className={cn(
                  'text-xs font-medium',
                  typeof trend === 'string' 
                    ? (trend === 'up' ? 'text-success' : 'text-error')
                    : (trend.isPositive ? 'text-success' : 'text-error')
                )}>
                  {typeof trend === 'string' 
                    ? (trend === 'up' ? '↗' : '↘')
                    : (trend.isPositive ? '+' : '') + trend.value
                  }
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-fg-3">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg flex-shrink-0',
              color === 'green' && 'bg-green-50 text-green-600',
              color === 'blue' && 'bg-blue-50 text-blue-600',
              color === 'red' && 'bg-red-50 text-red-600',
              color === 'orange' && 'bg-orange-50 text-orange-600',
              color === 'purple' && 'bg-purple-50 text-purple-600',
              !color && 'bg-surface-1 text-fg-3'
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}