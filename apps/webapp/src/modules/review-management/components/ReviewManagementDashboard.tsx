'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ClipboardList, FilePlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { ReviewManagementFilters } from './ReviewManagementFilters';
import { ReviewManagementFormTabs } from './ReviewManagementFormTabs';
import { ReviewManagementRotationPanel } from './ReviewManagementRotationPanel';
import { ReviewManagementRotationSelect } from './ReviewManagementRotationSelect';
import { useAutoSelectCurrentRotation } from '../hooks/useAutoSelectCurrentRotation';
import { useReviewManagementFilters } from '../hooks/useReviewManagementFilters';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllReviewFormsByYear } from '@/modules/review/hooks/useReviewForm';
import { getDefaultRotationQuarter } from '@/modules/review/utils/rotationUtils';
import { useListRotations } from '@/modules/rotations/hooks/useRotations';

interface ReviewManagementDashboardProps {
  selectedYear: number;
  selectedRotation: string;
  selectedRotationId: Id<'rotations'> | null;
}

function BrowseFormsSection({
  selectedYear,
  selectedRotation,
  onYearChange,
  onRotationChange,
}: {
  selectedYear: number;
  selectedRotation: string;
  onYearChange: (year: string) => void;
  onRotationChange: (rotation: string) => void;
}) {
  const rotationNumber = selectedRotation === 'all' ? undefined : Number(selectedRotation);

  const { forms: activeForms, isLoading: isLoadingActive } = useAllReviewFormsByYear(
    selectedYear,
    rotationNumber,
    undefined,
    undefined,
    false
  );

  const { forms: archivedForms, isLoading: isLoadingArchived } = useAllReviewFormsByYear(
    selectedYear,
    rotationNumber,
    undefined,
    undefined,
    true
  );

  if (isLoadingActive || isLoadingArchived) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReviewManagementFilters
        selectedYear={selectedYear}
        selectedRotation={selectedRotation}
        onYearChange={onYearChange}
        onRotationChange={onRotationChange}
      />
      <ReviewManagementFormTabs activeForms={activeForms} archivedForms={archivedForms} />
    </div>
  );
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
  const currentQuarter = useMemo(() => getDefaultRotationQuarter(), []);

  const { rotations, isLoading: isLoadingRotations } = useListRotations(true);

  const { handleYearChange, handleRotationChange, handleRotationIdChange } =
    useReviewManagementFilters({ selectedYear, selectedRotation, selectedRotationId });

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

  useAutoSelectCurrentRotation({
    selectedRotationId,
    rotations,
    isLoading: isLoadingRotations,
    currentYear,
    currentQuarter,
    onSelect: (rotationId, year, quarter) => {
      handleRotationIdChange(rotationId, { year, quarter });
    },
  });

  const selectedRotationMeta = rotations?.find((r) => r._id === selectedRotationId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Management</h1>
          <p className="text-sm text-muted-foreground">
            Generate review forms for each junior commander, then copy and send access links
          </p>
        </div>
        <Button asChild variant="outline" aria-label="Create a review form manually">
          <Link href="/app/review/create?returnTo=review-management" className="flex items-center">
            <FilePlus className="mr-2 h-4 w-4" />
            Create Manually
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate" className="gap-2">
            <Users className="h-4 w-4" />
            Generate Forms
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Browse All Forms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Select a rotation</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the rotation to see all assigned junior commanders. Generate a review form
                  for each JC and copy the buddy/JC links to send out.
                </p>
              </div>
              <ReviewManagementRotationSelect
                selectedRotationId={selectedRotationId}
                onRotationChange={handleRotationEntityChange}
              />
            </CardContent>
          </Card>

          {selectedRotationId ? (
            <ReviewManagementRotationPanel rotationId={selectedRotationId} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <Users className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p className="font-medium text-foreground">No rotation selected</p>
                <p className="text-sm mt-1">
                  Select a rotation above to view participants and generate review forms.
                </p>
                {rotations?.length === 0 && !isLoadingRotations && (
                  <p className="text-sm mt-4">
                    <Link href="/app/rotations" className="text-primary underline">
                      Create a rotation
                    </Link>{' '}
                    and assign junior commanders first.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {selectedRotationMeta && selectedRotationMeta.participantCount === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              This rotation has no participants yet.{' '}
              <Link
                href={`/app/rotations/${selectedRotationId}`}
                className="text-primary underline"
              >
                Assign junior commanders
              </Link>{' '}
              in Rotation Management.
            </p>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Search and manage all review forms by year and quarter. Use the Generate Forms tab to
            create forms for a specific rotation&apos;s participants.
          </p>
          <Separator />
          <BrowseFormsSection
            selectedYear={selectedYear}
            selectedRotation={selectedRotation}
            onYearChange={handleYearChange}
            onRotationChange={handleRotationChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
