'use client';

import { useRouter } from 'next/navigation';

import type { Rotation } from '../types';

import { Badge } from '@/components/ui/badge';
import { DataListField, DataListItem, DataListItemHeader } from '@/components/ui/data-list';

interface RotationListListItemProps {
  rotation: Rotation;
  displayLabel: string;
  formattedDate: string;
}

export function RotationListListItem({
  rotation,
  displayLabel,
  formattedDate,
}: RotationListListItemProps) {
  const router = useRouter();

  return (
    <DataListItem
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/app/rotations/${rotation._id}`)}
    >
      <DataListItemHeader title={displayLabel}>
        <Badge variant="secondary">Rotation {rotation.rotationQuarter}</Badge>
      </DataListItemHeader>
      <DataListField label="Year">{rotation.rotationYear}</DataListField>
      <DataListField label="Evaluation Date">{formattedDate}</DataListField>
      <DataListField label="Participants">{rotation.participantCount ?? 0}</DataListField>
    </DataListItem>
  );
}
