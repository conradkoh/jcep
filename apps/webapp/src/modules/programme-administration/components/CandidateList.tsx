'use client';

import { CandidateListItem } from './CandidateListItem';
import type { ProgrammeCandidate } from '../types';

import { DataList } from '@/components/ui/data-list';

interface CandidateListProps {
  candidates: ProgrammeCandidate[];
}

export function CandidateList({ candidates }: CandidateListProps) {
  if (candidates.length === 0) {
    return <p className="text-sm text-muted-foreground">No candidates found for this batch.</p>;
  }

  return (
    <DataList>
      {candidates.map((candidate) => (
        <CandidateListItem key={candidate.id} candidate={candidate} />
      ))}
    </DataList>
  );
}
