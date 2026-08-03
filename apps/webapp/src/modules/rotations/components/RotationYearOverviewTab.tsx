'use client';

import { useMemo, useState } from 'react';

import { useRotationYearOverview } from '../hooks/useRotations';
import type { Rotation } from '../types';
import { RotationYearTable } from './RotationYearTable';
import { UnmatchedReviewFormsPanel } from './UnmatchedReviewFormsPanel';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewYearSelect } from '@/modules/review/components/ReviewYearSelect';

interface RotationYearOverviewTabProps {
  isAdmin: boolean;
  rotations: Rotation[];
}

/**
 * Year-scoped view of rotations and participants with next rotation
 * preferences, plus unmatched review forms. Year select options derive from
 * the rotations list so years without any rotations are still reachable.
 */
export function RotationYearOverviewTab({ isAdmin, rotations }: RotationYearOverviewTabProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear]);
    rotations.forEach((rotation) => years.add(rotation.rotationYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [rotations, currentYear]);

  const { data: overview, isLoading } = useRotationYearOverview(selectedYear, isAdmin);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <ReviewYearSelect
            label="Year"
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(Number(year))}
            yearOptions={yearOptions}
          />
        </CardContent>
      </Card>

      {isLoading || !overview ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <RotationYearTable overview={overview} />
          <UnmatchedReviewFormsPanel overview={overview} />
        </>
      )}
    </div>
  );
}
