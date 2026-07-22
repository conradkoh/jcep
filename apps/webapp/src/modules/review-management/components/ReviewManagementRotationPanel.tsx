'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Check, Copy, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { GenerateReviewFormDialog } from './GenerateReviewFormDialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';
import { useReviewFormsByRotation } from '@/modules/review/hooks/useReviewForm';
import type { ReviewForm } from '@/modules/review/types';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';
import { useRotationWithParticipants } from '@/modules/rotations/hooks/useRotations';
import type { Rotation, RotationParticipant } from '@/modules/rotations/types';

interface ReviewManagementRotationPanelProps {
  rotationId: Id<'rotations'>;
}

function getRotationLabel(rotation: Rotation): string {
  return rotation.label || formatRotationLabel(rotation.rotationYear, rotation.rotationQuarter);
}

function findFormForParticipant(
  forms: ReviewForm[] | undefined,
  participantId: Id<'rotationParticipants'>
): ReviewForm | undefined {
  return forms?.find((form) => form.rotationParticipantId === participantId);
}

function CopyLinkButton({ token, label }: { token: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const link = `${window.location.origin}/review/token/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success(`${label} link copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [token, label]);

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
      {label}
    </Button>
  );
}

function ParticipantRow({
  participant,
  form,
  onGenerate,
}: {
  participant: RotationParticipant;
  form: ReviewForm | undefined;
  onGenerate: (participant: RotationParticipant) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{participant.fullName}</TableCell>
      <TableCell>{getAgeGroupLabel(participant.ageGroup)}</TableCell>
      <TableCell>
        {form ? (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Form created
          </Badge>
        ) : (
          <Badge variant="outline">No form</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {form ? (
          <div className="flex flex-wrap justify-end gap-2">
            <CopyLinkButton token={form.buddyAccessToken} label="Buddy" />
            <CopyLinkButton token={form.jcAccessToken} label="JC" />
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/review/${form._id}`}>View</Link>
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => onGenerate(participant)}>
            <FilePlus className="h-4 w-4 mr-1" />
            Generate Review Form
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

/**
 * Rotation-centric participant list with generate/copy actions.
 */
// fallow-ignore-next-line complexity
export function ReviewManagementRotationPanel({ rotationId }: ReviewManagementRotationPanelProps) {
  const authState = useAuthState();
  const adminUserId = authState?.state === 'authenticated' ? authState.user._id : null;

  const { data: rotationData, isLoading: isLoadingRotation } = useRotationWithParticipants(
    rotationId,
    true
  );
  const { forms, isLoading: isLoadingForms } = useReviewFormsByRotation(rotationId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<RotationParticipant | null>(null);

  const participants = useMemo(
    () => rotationData?.participants ?? [],
    [rotationData?.participants]
  );

  const formsCreatedCount = useMemo(
    () => participants.filter((p) => findFormForParticipant(forms, p._id)).length,
    [participants, forms]
  );

  const handleGenerate = useCallback((participant: RotationParticipant) => {
    setSelectedParticipant(participant);
    setDialogOpen(true);
  }, []);

  if (isLoadingRotation || isLoadingForms) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!rotationData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Rotation not found.
        </CardContent>
      </Card>
    );
  }

  const { rotation } = rotationData;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{getRotationLabel(rotation)}</CardTitle>
          <CardDescription>
            Generate review forms for each junior commander. {formsCreatedCount} of{' '}
            {participants.length} forms created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No junior commanders assigned to this rotation yet. Assign participants in{' '}
              <Link href={`/app/rotations/${rotationId}`} className="text-primary underline">
                Rotation Management
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Junior Commander</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <ParticipantRow
                    key={participant._id}
                    participant={participant}
                    form={findFormForParticipant(forms, participant._id)}
                    onGenerate={handleGenerate}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {adminUserId && (
        <GenerateReviewFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          rotation={rotation}
          participant={
            selectedParticipant
              ? {
                  participantId: selectedParticipant._id,
                  fullName: selectedParticipant.fullName,
                  ageGroup: selectedParticipant.ageGroup,
                }
              : null
          }
          adminUserId={adminUserId}
        />
      )}
    </>
  );
}
