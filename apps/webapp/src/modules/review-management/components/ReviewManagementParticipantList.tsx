'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';

import { ReviewManagementParticipantListItem } from './ReviewManagementParticipantListItem';

import { DataList } from '@/components/ui/data-list';
import type { ReviewForm } from '@/modules/review/types';
import type { RotationParticipant } from '@/modules/rotations/types';

function findFormForParticipant(
  forms: ReviewForm[] | undefined,
  participantId: Id<'rotationParticipants'>
): ReviewForm | undefined {
  return forms?.find((form) => form.rotationParticipantId === participantId);
}

export interface ReviewManagementParticipantListProps {
  participants: RotationParticipant[];
  forms: ReviewForm[] | undefined;
  onGenerate: (participant: RotationParticipant) => void;
}

export function ReviewManagementParticipantList({
  participants,
  forms,
  onGenerate,
}: ReviewManagementParticipantListProps) {
  return (
    <DataList>
      {participants.map((participant) => (
        <ReviewManagementParticipantListItem
          key={participant._id}
          participant={participant}
          form={findFormForParticipant(forms, participant._id)}
          onGenerate={onGenerate}
        />
      ))}
    </DataList>
  );
}
