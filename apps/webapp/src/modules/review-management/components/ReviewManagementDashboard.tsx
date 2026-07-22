'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { ReviewManagementFilters } from './ReviewManagementFilters';
import { ReviewManagementFormTabs } from './ReviewManagementFormTabs';
import { ReviewManagementRotationPanel } from './ReviewManagementRotationPanel';
import { ReviewManagementRotationSelect } from './ReviewManagementRotationSelect';
import { useReviewManagementFilters } from '../hooks/useReviewManagementFilters';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllReviewFormsByYear } from '@/modules/review/hooks/useReviewForm';
import { getDefaultRotationQuarter } from '@/modules/review/utils/rotationUtils';
import { useListRotations } from '@/modules/rotations/hooks/useRotations';

interface ReviewManagementDashboardProps {
  selectedYear: number;
  selectedRotation: string;
  selectedRotationId: Id<'rotations'> | null;
}

/**
 * Admin dashboard for managing all JCEP review forms across rotations.
 */
// fallow-ignore-next-line complexity
export function ReviewManagementDashboard({
  selectedYear,
  selectedRotation,
  selectedRotationId,
}: ReviewManagementDashboardProps) {
  const currentYear = new Date().getFullYear();
  const currentRotation = useMemo(() => getDefaultRotationQuarter(), []);
  const rotationNumber = selectedRotation === 'all' ? undefined : Number(selectedRotation);

  const { rotations } = useListRotations(true);

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

  const {
    handleYearChange,
    handleRotationChange,
    handleRotationIdChange,
    handleViewCurrentRotation,
  } = useReviewManagementFilters({ selectedYear, selectedRotation, selectedRotationId });

  const isViewingCurrentRotation =
    selectedYear === currentYear && selectedRotation === String(currentRotation);

  const handleRotationEntityChange = (rotationId: Id<'rotations'> | null) => {
    if (!rotationId) {
      handleRotationIdChange(null);
      return;
    }
    const rotation = rotations?.find((r) => r._id === rotationId);
    if (rotation) {
      handleRotationIdChange(rotationId, {
        year: rotation.rotationYear,
        quarter: rotation.rotationQuarter,
      });
    } else {
      handleRotationIdChange(rotationId);
    }
  };

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
            Select a rotation to generate review forms, or browse all forms below
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isViewingCurrentRotation && !selectedRotationId && (
            <Button
              variant="outline"
              onClick={() => handleViewCurrentRotation(currentYear, currentRotation)}
              aria-label="View most recent rotation"
            >
              <Clock className="mr-2 h-4 w-4" />
              Current Rotation
            </Button>
          )}
          <Button asChild aria-label="Create a new review form manually">
            <Link
              href="/app/review/create?returnTo=review-management"
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Manually
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <ReviewManagementRotationSelect
        selectedRotationId={selectedRotationId}
        onRotationChange={handleRotationEntityChange}
      />

      {selectedRotationId && <ReviewManagementRotationPanel rotationId={selectedRotationId} />}

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
