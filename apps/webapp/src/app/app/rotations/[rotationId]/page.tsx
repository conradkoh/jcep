'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft, Shield, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { ROTATIONS_MANAGE_PERMISSION, useHasPermission } from '@/application/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';
import { RotationRosterTable } from '@/modules/rotations/components/RotationRosterTable';
import { useDeleteRotation, useRotationRoster } from '@/modules/rotations/hooks/useRotations';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getRotationDisplayLabel(rotation: {
  label?: string;
  rotationYear: number;
  rotationQuarter: number;
}): string {
  return rotation.label || formatRotationLabel(rotation.rotationYear, rotation.rotationQuarter);
}

function RotationDetailContent({ rotationId }: { rotationId: Id<'rotations'> }) {
  const isAdmin = useHasPermission(ROTATIONS_MANAGE_PERMISSION);

  const { data, isLoading } = useRotationRoster(rotationId, isAdmin);
  const deleteRotation = useDeleteRotation();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">
                Only programme administrators can manage rotations.
              </p>
              <Link href="/app" className={buttonVariants({ variant: 'outline' })}>
                Back to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading rotation...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Rotation not found.</p>
              <Link href="/app/rotations" className={buttonVariants({ variant: 'outline' })}>
                Back to Rotations
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const { rotation, applicants } = data;
  const participantCount = applicants.filter((a) => a.ageGroupOnRotation !== null).length;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRotation({ rotationId });
      toast.success('Rotation deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete rotation');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Link
              href="/app/rotations"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getRotationDisplayLabel(rotation)}
              </h1>
              <p className="text-muted-foreground mt-1">Manage participants for this rotation</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }))}
              disabled={participantCount > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Rotation
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Rotation</AlertDialogTitle>
                <AlertDialogDescription>
                  {participantCount > 0
                    ? 'Cannot delete rotation with participants. Remove all participants first.'
                    : 'Are you sure you want to delete this rotation? This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {participantCount === 0 && (
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Rotation Info */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="text-lg font-semibold text-foreground">{rotation.rotationYear}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rotation</p>
              <p className="text-lg font-semibold text-foreground">
                Rotation {rotation.rotationQuarter}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Evaluation Date</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDate(rotation.evaluationDate)}
              </p>
            </div>
          </div>
          {rotation.label && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Label</p>
              <p className="text-lg font-semibold text-foreground">{rotation.label}</p>
            </div>
          )}
        </Card>

        {/* Participants Summary */}
        <Card className="p-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-foreground">
              <span className="font-semibold">{participantCount}</span> participant
              {participantCount !== 1 ? 's' : ''} assigned of {applicants.length} eligible
            </p>
          </div>
        </Card>

        {/* Roster */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Applicant Roster ({applicants.length} eligible)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Applicants submitted within 1 year of the evaluation date. Assign each to a rotation or
            leave unassigned.
          </p>
          <RotationRosterTable currentRotationId={rotationId} applicants={applicants} />
        </div>
      </div>
    </div>
  );
}

export default function RotationDetailPage({
  params,
}: {
  params: Promise<{ rotationId: string }>;
}) {
  const { rotationId } = use(params);

  return (
    <RequireLogin>
      <RotationDetailContent rotationId={rotationId as Id<'rotations'>} />
    </RequireLogin>
  );
}
