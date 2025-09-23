import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export function SectionHeader({ title, description, action, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-fg-1">{title}</h2>
        {description && (
          <p className="text-sm text-fg-3 mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button onClick={action.onClick} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}