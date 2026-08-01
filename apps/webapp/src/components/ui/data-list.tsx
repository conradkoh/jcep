import type * as React from 'react';

import { cn } from '@/lib/utils';

export function DataList({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="data-list" className={cn('flex flex-col gap-3', className)} {...props} />;
}

export function DataListItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="data-list-item"
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  );
}

interface DataListItemHeaderProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode;
}

export function DataListItemHeader({
  title,
  className,
  children,
  ...props
}: DataListItemHeaderProps) {
  return (
    <div
      data-slot="data-list-item-header"
      className={cn(
        'flex items-start justify-between gap-3 border-b border-border px-4 py-3',
        className
      )}
      {...props}
    >
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </div>
  );
}

interface DataListFieldProps extends React.ComponentProps<'div'> {
  label: React.ReactNode;
}

export function DataListField({ label, className, children, ...props }: DataListFieldProps) {
  return (
    <div
      data-slot="data-list-field"
      className={cn('flex items-center justify-between gap-4 px-4 py-2 text-sm', className)}
      {...props}
    >
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

export function DataListItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="data-list-item-footer"
      className={cn('flex flex-wrap gap-2 border-t border-border px-4 py-3', className)}
      {...props}
    />
  );
}
