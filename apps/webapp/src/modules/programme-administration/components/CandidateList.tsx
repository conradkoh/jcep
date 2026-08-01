'use client';

import { CandidateListItem } from './CandidateListItem';
import type { ProgrammeCandidate } from '../types';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CandidateListProps {
  candidates: ProgrammeCandidate[];
}

export function CandidateList({ candidates }: CandidateListProps) {
  if (candidates.length === 0) {
    return <p className="text-sm text-muted-foreground">No candidates found for this batch.</p>;
  }

  return (
    <Card>
      <div className="overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Year born</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <CandidateListItem key={candidate.id} candidate={candidate} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
