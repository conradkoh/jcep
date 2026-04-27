'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { APPLICANTS } from '../../config/applicants';
import { useCreateReviewForm } from '../../hooks/useReviewForm';
import { getDefaultRotationQuarter } from '../../utils/rotationUtils';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkReviewFormCreateProps {
  currentUserId: Id<'users'>;
}

export function BulkReviewFormCreate({ currentUserId }: BulkReviewFormCreateProps) {
  const router = useRouter();
  const createForm = useCreateReviewForm();
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [failedApplicants, setFailedApplicants] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();
  const rotationQuarter = getDefaultRotationQuarter();

  const allSelected = selectedApplicants.size === APPLICANTS.length;

  const toggleApplicant = (name: string) => {
    setSelectedApplicants((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(APPLICANTS.map((a) => a.name)));
    }
  };

  const handleCreate = async () => {
    if (selectedApplicants.size === 0) {
      toast.error('Please select at least one applicant');
      return;
    }

    setIsCreating(true);
    setProgress({ completed: 0, total: selectedApplicants.size });
    setFailedApplicants([]);

    const selectedList = APPLICANTS.filter((a) => selectedApplicants.has(a.name));
    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const applicant of selectedList) {
      try {
        await createForm({
          rotationYear: currentYear,
          rotationQuarter,
          buddyUserId: currentUserId,
          buddyName: '',
          juniorCommanderUserId: null,
          juniorCommanderName: applicant.name,
          ageGroup: applicant.ageGroup,
          evaluationDate: Date.now(),
        });
        succeeded.push(applicant.name);
      } catch {
        failed.push(applicant.name);
      }
      setProgress({ completed: succeeded.length + failed.length, total: selectedList.length });
    }

    setIsCreating(false);
    setProgress(null);
    setFailedApplicants(failed);

    if (failed.length === 0) {
      toast.success(`Created ${succeeded.length} review form(s) successfully!`);
    } else if (succeeded.length > 0) {
      toast.warning(
        `Created ${succeeded.length} form(s), ${failed.length} failed: ${failed.join(', ')}`
      );
    } else {
      toast.error(`Failed to create all ${failed.length} forms`);
    }

    if (succeeded.length > 0) {
      router.push('/app/review');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Create Review Forms</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select applicants to generate review forms for {currentYear} Rotation {rotationQuarter}
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        {progress && (
          <div className="mb-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            {progress.completed === progress.total
              ? 'Processing complete...'
              : `Creating form ${progress.completed} of ${progress.total}...`}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            disabled={isCreating}
            className="text-muted-foreground hover:text-foreground"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedApplicants.size} of {APPLICANTS.length} selected
          </span>
        </div>

        <div className="space-y-2">
          {APPLICANTS.map((applicant) => (
            <div
              key={applicant.name}
              className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
            >
              <Checkbox
                id={applicant.name}
                checked={selectedApplicants.has(applicant.name)}
                onCheckedChange={() => toggleApplicant(applicant.name)}
                disabled={isCreating}
              />
              <label
                htmlFor={applicant.name}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{applicant.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {applicant.displayGroup}
                </span>
              </label>
            </div>
          ))}
        </div>

        {failedApplicants.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Failed to create forms:</p>
            <ul className="mt-1 list-inside list-disc">
              {failedApplicants.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCreate}
            disabled={isCreating || selectedApplicants.size === 0}
            className="flex-1"
          >
            {isCreating
              ? `Creating ${progress?.completed ?? ''}...`
              : `Generate ${selectedApplicants.size} Form${selectedApplicants.size === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
