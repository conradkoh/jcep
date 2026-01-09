'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'accent' | 'muted';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    accent: 'bg-primary/5 border-primary/20',
    muted: 'bg-muted/30 border-muted',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-md group',
        variantStyles[variant],
        className
      )}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'p-2 rounded-lg transition-colors',
              variant === 'accent' ? 'bg-primary/10' : 'bg-muted/50'
            )}
          >
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}
