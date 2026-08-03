'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useLinkReviewFormToParticipant,
  useSearchApplicants,
  useSetApplicantAssignment,
} from '../hooks/useRotations';
import type { UnmatchedReviewForm } from '../types';

import { Badge } from '@/components/ui/badge';
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
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

interface AddToRotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UnmatchedReviewForm;
  rotationId: Id<'rotations'>;
}

/**
 * Dialog to add a junior commander (from a JCEP application on file) to the
 * matching rotation, then link the unmatched review form to the new
 * participant. If the link step fails after assignment, an error is shown and
 * the dialog stays open — success is only claimed when both steps complete.
 */
// fallow-ignore-next-line complexity
export function AddToRotationDialog({
  open,
  onOpenChange,
  form,
  rotationId,
}: AddToRotationDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{
    applicationId: Id<'jcepApplications'>;
    fullName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setApplicantAssignment = useSetApplicantAssignment();
  const linkForm = useLinkReviewFormToParticipant();
  const { results, isLoading } = useSearchApplicants(searchTerm, rotationId, true);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchTerm('');
      setSelected(null);
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  // fallow-ignore-next-line complexity
  const handleAdd = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const { participantId } = await setApplicantAssignment({
        applicationId: selected.applicationId,
        rotationId,
        ageGroup: form.ageGroup,
      });
      if (!participantId) {
        throw new Error('Failed to add participant to rotation');
      }
      await linkForm({ formId: form.formId, participantId });
      toast.success(`${selected.fullName} added to rotation`);
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to rotation');
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(selected);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Rotation</DialogTitle>
          <DialogDescription>
            Add a junior commander to Rotation {form.rotationNumber} and link{' '}
            {form.juniorCommanderName}&apos;s review form ({getAgeGroupLabel(form.ageGroup)}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Junior Commander</span>
              <span className="font-medium text-foreground">{form.juniorCommanderName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Age Group</span>
              <span className="font-medium text-foreground">{getAgeGroupLabel(form.ageGroup)}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for junior commander by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm.trim().length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search applications on file.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Searching...</p>
          ) : results && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matching application found. The junior commander must have a JCEP application on
              file.
            </p>
          ) : (
            <ul className="space-y-2">
              {(results ?? []).map((app) => (
                <li key={app._id}>
                  <button
                    type="button"
                    onClick={() => setSelected({ applicationId: app._id, fullName: app.fullName })}
                    className={
                      selected?.applicationId === app._id
                        ? 'flex w-full items-center justify-between gap-3 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-left'
                        : 'flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left hover:bg-muted/50'
                    }
                  >
                    <span className="font-medium text-sm break-words">{app.fullName}</span>
                    <Badge variant="outline" className="shrink-0">
                      {getAgeGroupLabel(app.ageGroupChoice1)}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? 'Adding...' : 'Add to Rotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
