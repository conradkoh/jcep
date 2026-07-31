'use client';

import { useEffect, useState } from 'react';

import { CandidateBatchSelect } from './CandidateBatchSelect';
import { CandidateList } from './CandidateList';
import { useCandidateBatches, useCandidatesByBatch } from '../hooks/useProgrammeCandidates';

import { APPLICATIONS_MANAGE_PERMISSION, useHasPermission } from '@/application/auth';
import { Skeleton } from '@/components/ui/skeleton';

function ProgrammeCandidatesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function ProgrammeCandidatesResults({
  selectedBatch,
  isAdmin,
}: {
  selectedBatch: number | null;
  isAdmin: boolean;
}) {
  const { candidates, isLoading } = useCandidatesByBatch(selectedBatch, isAdmin);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return <CandidateList candidates={candidates ?? []} />;
}

export function ProgrammeAdministrationDashboard() {
  const isAdmin = useHasPermission(APPLICATIONS_MANAGE_PERMISSION);
  const { batches, isLoading: batchesLoading } = useCandidateBatches(isAdmin);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  useEffect(() => {
    if (batches && batches.length > 0 && selectedBatch === null) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch]);

  if (batchesLoading) {
    return <ProgrammeCandidatesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programme Candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View possible candidates grouped by birth-year batch.
        </p>
      </div>

      {batches && batches.length > 0 && selectedBatch !== null && (
        <CandidateBatchSelect
          batches={batches}
          selectedBatch={selectedBatch}
          onBatchChange={(year) => setSelectedBatch(Number(year))}
        />
      )}

      <ProgrammeCandidatesResults selectedBatch={selectedBatch} isAdmin={isAdmin} />
    </div>
  );
}
