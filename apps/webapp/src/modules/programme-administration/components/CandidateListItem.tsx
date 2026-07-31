'use client';

import type { ProgrammeCandidate } from '../types';

import { TableCell, TableRow } from '@/components/ui/table';

interface CandidateListItemProps {
  candidate: ProgrammeCandidate;
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{candidate.fullName}</TableCell>
      <TableCell>{candidate.birthYear}</TableCell>
    </TableRow>
  );
}
