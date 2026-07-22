'use client';

import { Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { ReviewManagementFilters } from './ReviewManagementFilters';
import { ReviewManagementFormTabs } from './ReviewManagementFormTabs';
import { useReviewManagementFilters } from '../hooks/useReviewManagementFilters';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllReviewFormsByYear } from '@/modules/review/hooks/useReviewForm';
import { getDefaultRotationQuarter } from '@/modules/review/utils/rotationUtils';

interface ReviewManagementDashboardProps {
  selectedYear: number;
  selectedRotation: string;
}

/**
 * Admin dashboard for managing all JCEP review forms across rotations.
 */
// fallow-ignore-next-line complexity
export function ReviewManagementDashboard({
  selectedYear,
  selectedRotation,
}: ReviewManagementDashboardProps) {
  const currentYear = new Date().getFullYear();
  const currentRotation = useMemo(() => getDefaultRotationQuarter(), []);
  const rotationNumber = selectedRotation === 'all' ? undefined : Number(selectedRotation);

  const { forms: activeForms, isLoading: isLoadingActiveForms } = useAllReviewFormsByYear(
    selectedYear,
    rotationNumber,
    undefined,
    undefined,
    false
  );

  const { forms: archivedForms, isLoading: isLoadingArchivedForms } = useAllReviewFormsByYear(
    selectedYear,
    rotationNumber,
    undefined,
    undefined,
    true
  );

  const { handleYearChange, handleRotationChange, handleViewCurrentRotation } =
    useReviewManagementFilters({ selectedYear, selectedRotation });

  const isViewingCurrentRotation =
    selectedYear === currentYear && selectedRotation === String(currentRotation);

  if (isLoadingActiveForms || isLoadingArchivedForms) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all JCEP review forms across rotations
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isViewingCurrentRotation && (
            <Button
              variant="outline"
              onClick={() => handleViewCurrentRotation(currentYear, currentRotation)}
              aria-label="View most recent rotation"
            >
              <Clock className="mr-2 h-4 w-4" />
              Current Rotation
            </Button>
          )}
          <Button asChild aria-label="Create a new review form">
            <Link
              href="/app/review/create?returnTo=review-management"
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Form
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <ReviewManagementFilters
        selectedYear={selectedYear}
        selectedRotation={selectedRotation}
        onYearChange={handleYearChange}
        onRotationChange={handleRotationChange}
      />

      <ReviewManagementFormTabs activeForms={activeForms} archivedForms={archivedForms} />
    </div>
  );
}
