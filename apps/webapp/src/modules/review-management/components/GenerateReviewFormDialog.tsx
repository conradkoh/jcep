'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';
import { useCreateReviewForm } from '@/modules/review/hooks/useReviewForm';
import type { AgeGroup } from '@/modules/review/types';
import type { Rotation } from '@/modules/rotations/types';

export interface GenerateReviewFormParticipant {
  participantId: Id<'rotationParticipants'>;
  fullName: string;
  ageGroup: AgeGroup;
}

interface GenerateReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotation: Rotation;
  participant: GenerateReviewFormParticipant | null;
  adminUserId: Id<'users'>;
  onCreated?: () => void;
}

/**
 * Dialog to generate a review form for a rotation participant.
 */
// fallow-ignore-next-line complexity
export function GenerateReviewFormDialog({
  open,
  onOpenChange,
  rotation,
  participant,
  adminUserId,
  onCreated,
}: GenerateReviewFormDialogProps) {
  const createForm = useCreateReviewForm();
  const [buddyName, setBuddyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setBuddyName('');
      setIsCreating(false);
    }
    onOpenChange(nextOpen);
  };

  const handleGenerate = async () => {
    if (!participant) return;
    if (!buddyName.trim()) {
      toast.error('Please enter the buddy name');
      return;
    }

    setIsCreating(true);
    try {
      await createForm({
        rotationYear: rotation.rotationYear,
        rotationQuarter: rotation.rotationQuarter,
        buddyUserId: adminUserId,
        buddyName: buddyName.trim(),
        juniorCommanderUserId: null,
        juniorCommanderName: participant.fullName,
        ageGroup: participant.ageGroup,
        evaluationDate: rotation.evaluationDate,
        rotationId: rotation._id,
        rotationParticipantId: participant.participantId,
      });
      toast.success(`Review form created for ${participant.fullName}`);
      handleOpenChange(false);
      onCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create review form');
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Review Form</DialogTitle>
          <DialogDescription>
            Enter the buddy name for {participant?.fullName ?? 'this junior commander'}.
          </DialogDescription>
        </DialogHeader>
        {participant && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Junior Commander</span>
                <span className="font-medium text-foreground">{participant.fullName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Age Group</span>
                <span className="font-medium text-foreground">
                  {getAgeGroupLabel(participant.ageGroup)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buddy-name">Buddy Name</Label>
              <Input
                id="buddy-name"
                placeholder="Enter buddy name"
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isCreating || !buddyName.trim()}>
            {isCreating ? 'Generating...' : 'Generate Form'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
