'use client';

import type { RotationYearColumn, RotationYearOverview, RotationYearParticipant } from '../types';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';

// fallow-ignore-next-line complexity
function ParticipantItem({ participant }: { participant: RotationYearParticipant }) {
  return (
    <li>
      <p className="font-medium text-sm break-words">{participant.fullName}</p>
      <p
        className={cn(
          'text-xs',
          participant.reviewFormId && participant.nextRotationPreference
            ? 'text-foreground'
            : 'text-muted-foreground'
        )}
      >
        {participant.reviewFormId
          ? participant.nextRotationPreference
            ? getAgeGroupLabel(participant.nextRotationPreference)
            : 'Pending'
          : 'No form'}
      </p>
    </li>
  );
}

function RotationYearColumnCell({ column }: { column: RotationYearColumn }) {
  return (
    <TableCell className="whitespace-normal align-top">
      {column.participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No participants</p>
      ) : (
        <ul className="space-y-3">
          {column.participants.map((participant) => (
            <ParticipantItem key={participant.participantId} participant={participant} />
          ))}
        </ul>
      )}
    </TableCell>
  );
}

/**
 * Rotation matrix table: one column per rotation, each listing its
 * participants with the JC-stated next rotation preference from the linked
 * review form. Missing preference or form renders muted.
 */
export function RotationYearTable({ overview }: { overview: RotationYearOverview }) {
  if (overview.rotations.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground text-center py-6">
          No rotations created for {overview.year}.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              {overview.rotations.map((col) => (
                <TableHead key={col.rotation._id} className="whitespace-normal break-words">
                  {col.rotation.label ||
                    formatRotationLabel(col.rotation.rotationYear, col.rotation.rotationQuarter)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {overview.rotations.map((col) => (
                <RotationYearColumnCell key={col.rotation._id} column={col} />
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
