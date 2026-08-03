'use client';

import { useRouter } from 'next/navigation';

import type { Rotation } from '../types';
import { RotationListListItem } from './RotationListListItem';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DataList } from '@/components/ui/data-list';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';

interface RotationListProps {
  rotations: Rotation[];
}

function getRotationDisplayLabel(rotation: Rotation): string {
  return rotation.label || formatRotationLabel(rotation.rotationYear, rotation.rotationQuarter);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function RotationList({ rotations }: RotationListProps) {
  const router = useRouter();

  if (rotations.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No rotations created yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Desktop table — unchanged markup, only wrapped */}
      <div className="hidden md:block overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[35%]">Label</TableHead>
              <TableHead className="w-[15%]">Year</TableHead>
              <TableHead className="w-[15%]">Rotation</TableHead>
              <TableHead className="w-[20%]">Evaluation Date</TableHead>
              <TableHead className="w-[15%]">Participants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotations.map((rotation) => (
              <TableRow
                key={rotation._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/app/rotations/${rotation._id}`)}
              >
                <TableCell className="font-medium">{getRotationDisplayLabel(rotation)}</TableCell>
                <TableCell>{rotation.rotationYear}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Rotation {rotation.rotationQuarter}</Badge>
                </TableCell>
                <TableCell>{formatDate(rotation.evaluationDate)}</TableCell>
                <TableCell>{rotation.participantCount ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden p-3">
        <DataList>
          {rotations.map((rotation) => (
            <RotationListListItem
              key={rotation._id}
              rotation={rotation}
              displayLabel={getRotationDisplayLabel(rotation)}
              formattedDate={formatDate(rotation.evaluationDate)}
            />
          ))}
        </DataList>
      </div>
    </Card>
  );
}
