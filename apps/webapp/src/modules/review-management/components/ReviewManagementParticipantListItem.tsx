'use client';

import { FilePlus } from 'lucide-react';
import Link from 'next/link';

import { CopyReviewFormLinkButton } from './CopyReviewFormLinkButton';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DataListField,
  DataListItem,
  DataListItemFooter,
  DataListItemHeader,
} from '@/components/ui/data-list';
import { cn } from '@/lib/utils';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';
import {
  ReviewFormBuddyProgressBadge,
  ReviewFormJCProgressBadge,
} from '@/modules/review/components/ReviewFormProgressBadges';
import { ReviewFormVisibilityToggle } from '@/modules/review/components/ReviewFormVisibilityToggle';
import type { ReviewForm } from '@/modules/review/types';
import type { RotationParticipant } from '@/modules/rotations/types';

export interface ReviewManagementParticipantListItemProps {
  participant: RotationParticipant;
  form: ReviewForm | undefined;
  onGenerate: (participant: RotationParticipant) => void;
}

export function ReviewManagementParticipantListItem({
  participant,
  form,
  onGenerate,
}: ReviewManagementParticipantListItemProps) {
  return (
    <DataListItem>
      <DataListItemHeader title={participant.fullName}>
        {form ? (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Form created
          </Badge>
        ) : (
          <Badge variant="outline">No form</Badge>
        )}
      </DataListItemHeader>
      <DataListField label="Buddy">
        {form ? form.buddyName : <span className="text-muted-foreground">&mdash;</span>}
      </DataListField>
      <DataListField label="Age Group">{getAgeGroupLabel(participant.ageGroup)}</DataListField>
      <DataListField label="Buddy Sections">
        {form ? (
          <ReviewFormBuddyProgressBadge form={form} />
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        )}
      </DataListField>
      <DataListField label="JC Sections">
        {form ? (
          <ReviewFormJCProgressBadge form={form} />
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        )}
      </DataListField>
      <DataListField label="Visibility">
        {form ? (
          <ReviewFormVisibilityToggle form={form} />
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        )}
      </DataListField>
      <DataListItemFooter className={form ? 'justify-between' : undefined}>
        {form ? (
          <>
            <div className="flex flex-wrap gap-2">
              <CopyReviewFormLinkButton token={form.buddyAccessToken} label="Buddy" />
              <CopyReviewFormLinkButton token={form.jcAccessToken} label="JC" />
            </div>
            <Link
              href={`/app/review/${form._id}`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100'
              )}
            >
              View
            </Link>
          </>
        ) : (
          <Button size="sm" onClick={() => onGenerate(participant)}>
            <FilePlus className="mr-1 h-4 w-4" />
            Generate Review Form
          </Button>
        )}
      </DataListItemFooter>
    </DataListItem>
  );
}
