'use client';

import { motion } from 'framer-motion';

import { Skeleton } from './skeleton';

import { cn } from '@/lib/utils';

interface StaggeredSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'list' | 'avatar';
}

export function StaggeredSkeleton({
  count = 3,
  className,
  variant = 'list',
}: StaggeredSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className={cn('space-y-4', className)}>
      {skeletons.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.1,
            duration: 0.3,
            ease: 'easeOut',
          }}
        >
          {variant === 'card' && (
            <div className="space-y-3 p-6 border rounded-lg">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          )}

          {variant === 'list' && (
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          )}

          {variant === 'avatar' && (
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
