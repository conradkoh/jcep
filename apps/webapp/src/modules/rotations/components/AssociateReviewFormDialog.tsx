'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';
import { toast } from 'sonner';

import { useLinkReviewFormToParticipant } from '../hooks/useRotations';
import type { RotationYearOverview, UnmatchedReviewForm } from '../types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssociateReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: RotationYearOverview;
  form: UnmatchedReviewForm;
}

/**
 * Dialog to link an unmatched review form to an existing participant on the
 * matching rotation. Only lists participants without a linked form (backend
 * rejects linking to a participant that already has an active form).
 */
// fallow-ignore-next-line complexity
export function AssociateReviewFormDialog({
  open,
  onOpenChange,
  overview,
  form,
}: AssociateReviewFormDialogProps) {
  const column = overview.rotations.find((c) => c.rotation.rotationQuarter === form.rotationNumber);
  const candidates = (column?.participants ?? []).filter((p) => p.reviewFormId == null);
  const [participantId, setParticipantId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const linkForm = useLinkReviewFormToParticipant();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setParticipantId('');
      setIsLinking(false);
    }
    onOpenChange(nextOpen);
  };

  const handleAssociate = async () => {
    if (!participantId) return;
    setIsLinking(true);
    try {
      await linkForm({
        formId: form.formId,
        participantId: participantId as Id<'rotationParticipants'>,
      });
      toast.success('Review form associated with participant');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to associate form');
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associate Review Form</DialogTitle>
          <DialogDescription>
            Link {form.juniorCommanderName}&apos;s review form (Rotation {form.rotationNumber}) to a
            participant without a form.
          </DialogDescription>
        </DialogHeader>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No unlinked participants available in this rotation.
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="participant-select">Participant</Label>
            <Select value={participantId} onValueChange={(v) => v !== null && setParticipantId(v)}>
              <SelectTrigger id="participant-select" className="w-full">
                <SelectValue placeholder="Select a participant" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((p) => (
                  <SelectItem key={p.participantId} value={p.participantId}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLinking}>
            Cancel
          </Button>
          <Button onClick={handleAssociate} disabled={isLinking || !participantId}>
            Associate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
