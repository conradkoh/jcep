'use client';

import type { ProgrammeCandidate } from '../types';

import { DataListField, DataListItem, DataListItemHeader } from '@/components/ui/data-list';

interface CandidateListItemProps {
  candidate: ProgrammeCandidate;
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  return (
    <DataListItem>
      <DataListItemHeader title={candidate.fullName} />
      <DataListField label="Year born">{candidate.birthYear}</DataListField>
    </DataListItem>
  );
}
