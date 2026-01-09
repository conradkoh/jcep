'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  visualType?: 'abstract' | 'illustrated' | 'minimal';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  visualType = 'abstract',
}: EmptyStateProps) {
  const visualStyles = {
    abstract: 'bg-primary/10 blur-xl',
    illustrated: 'bg-gradient-to-br from-primary/5 to-accent/5',
    minimal: 'bg-muted/30',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-6',
        className
      )}
    >
      {/* Visual element with glow */}
      <div className="relative">
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            visualStyles[visualType]
          )}
        />
        <Icon className="relative h-16 w-16 md:h-20 md:w-20 text-muted-foreground/50 transition-transform hover:scale-110" />
      </div>

      {/* Text content */}
      <div className="space-y-2 max-w-sm">
        <h3 className="font-semibold text-lg md:text-xl text-foreground">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Action button */}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
