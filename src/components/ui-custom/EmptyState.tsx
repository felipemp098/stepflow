import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
    >
      <Card className="shadow-card-md">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-surface-1 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-fg-3" />
          </div>
          <h3 className="text-lg font-semibold text-fg-1 mb-2">{title}</h3>
          <p className="text-fg-3 mb-6 max-w-sm mx-auto">{description}</p>
          {action && (
            <Button onClick={action.onClick} className="bg-primary hover:bg-primary/90">
              {action.label}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}