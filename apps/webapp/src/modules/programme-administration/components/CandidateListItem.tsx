'use client';

import type { ProgrammeCandidate } from '../types';

import { DataListField, DataListItem, DataListItemHeader } from '@/components/ui/data-list';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

interface CandidateListItemProps {
  candidate: ProgrammeCandidate;
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  return (
    <DataListItem>
      <DataListItemHeader title={candidate.fullName} />
      {candidate.contactNumber && (
        <DataListField label="Contact">{candidate.contactNumber}</DataListField>
      )}
      {candidate.ageGroup && (
        <DataListField label="Age Group">{getAgeGroupLabel(candidate.ageGroup)}</DataListField>
      )}
    </DataListItem>
  );
}
