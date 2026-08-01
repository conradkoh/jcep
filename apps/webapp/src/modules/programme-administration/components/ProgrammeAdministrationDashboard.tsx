'use client';

import { useEffect, useState } from 'react';

import { CandidateBatchSelect } from './CandidateBatchSelect';
import { CandidateList } from './CandidateList';
import { useCandidateBatches, useCandidatesByBatches } from '../hooks/useProgrammeCandidates';

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
  selectedJcepBatchYears,
  isAdmin,
}: {
  selectedJcepBatchYears: number[];
  isAdmin: boolean;
}) {
  const { candidates, isLoading } = useCandidatesByBatches(selectedJcepBatchYears, isAdmin);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return <CandidateList candidates={candidates ?? []} />;
}

export function ProgrammeAdministrationDashboard() {
  const isAdmin = useHasPermission(APPLICATIONS_MANAGE_PERMISSION);
  const { batches, isLoading: batchesLoading } = useCandidateBatches(isAdmin);
  const [selectedJcepBatchYears, setSelectedJcepBatchYears] = useState<number[]>([]);

  useEffect(() => {
    if (batches && batches.length > 0 && selectedJcepBatchYears.length === 0) {
      setSelectedJcepBatchYears([batches[0]]);
    }
  }, [batches, selectedJcepBatchYears]);

  if (batchesLoading) {
    return <ProgrammeCandidatesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programme Candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View possible candidates across selected JCEP batch years.
        </p>
      </div>

      {batches && batches.length > 0 && (
        <CandidateBatchSelect
          batches={batches}
          selectedBatches={selectedJcepBatchYears}
          onBatchesChange={setSelectedJcepBatchYears}
        />
      )}

      <ProgrammeCandidatesResults
        selectedJcepBatchYears={selectedJcepBatchYears}
        isAdmin={isAdmin}
      />
    </div>
  );
}
