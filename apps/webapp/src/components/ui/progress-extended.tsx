'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import type * as React from 'react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ProgressExtendedProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  milestones?: number[];
  showMilestoneCelebration?: boolean;
  showPercentage?: boolean;
}

export function ProgressExtended({
  value,
  milestones = [],
  showMilestoneCelebration = true,
  className,
  showPercentage = true,
  ...props
}: ProgressExtendedProps) {
  const [lastMilestone, setLastMilestone] = useState<number | null>(null);
  const progressValue = value ?? 0;

  useEffect(() => {
    const milestone = milestones.find(
      (m) => progressValue >= m && (!lastMilestone || m > lastMilestone)
    );
    if (milestone && showMilestoneCelebration) {
      setLastMilestone(milestone);
      setTimeout(() => setLastMilestone(null), 2000);
    }
  }, [progressValue, milestones, lastMilestone, showMilestoneCelebration]);

  const isComplete = progressValue === 100;

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Progress</span>
        {showPercentage && (
          <motion.span
            key={progressValue}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {Math.round(progressValue)}%
          </motion.span>
        )}
      </div>

      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn('relative h-3 w-full overflow-hidden rounded-full bg-primary/10', className)}
        {...props}
      >
        <motion.div
          className={cn(
            'h-full flex-1 transition-all',
            isComplete ? 'bg-green-600 dark:bg-green-500' : 'bg-primary'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          {progressValue < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>

        {/* Milestone markers */}
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className={cn(
              'absolute top-0 bottom-0 w-0.5 bg-background/80',
              progressValue >= milestone && 'bg-white/40'
            )}
            style={{ left: `${milestone}%` }}
          />
        ))}
      </ProgressPrimitive.Root>

      {/* Completion celebration */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute right-0 -top-1 z-10"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone celebration */}
      <AnimatePresence>
        {lastMilestone && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            className="absolute right-0 -top-1 z-10"
          >
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
