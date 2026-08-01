'use client';

import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

import type { ReviewForm } from '../../types';
import { formatRotationLabel, getReviewFormRotationNumber } from '../../utils/rotationUtils';
import {
  ReviewFormBuddyProgressBadge,
  ReviewFormJCProgressBadge,
} from '../ReviewFormProgressBadges';
import { ReviewFormStatusBadge } from '../ReviewFormStatusBadge';
import { ReviewFormVisibilityToggle } from '../ReviewFormVisibilityToggle';

import { Button } from '@/components/ui/button';
import {
  DataListField,
  DataListItem,
  DataListItemFooter,
  DataListItemHeader,
} from '@/components/ui/data-list';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

export interface AdminReviewListingListItemProps {
  form: ReviewForm;
  copiedToken: string | null;
  showArchiveAction?: boolean;
  showUnarchiveAction?: boolean;
  archivingFormId: string | null;
  onCopyBuddy: (form: ReviewForm) => void;
  onCopyJC: (form: ReviewForm) => void;
  onArchive: (form: ReviewForm) => void;
  onUnarchive: (form: ReviewForm) => void;
  onDelete: (form: ReviewForm) => void;
}

export function AdminReviewListingListItem({
  form,
  copiedToken,
  showArchiveAction,
  showUnarchiveAction,
  archivingFormId,
  onCopyBuddy,
  onCopyJC,
  onArchive,
  onUnarchive,
  onDelete,
}: AdminReviewListingListItemProps) {
  const rotationLabel = formatRotationLabel(form.rotationYear, getReviewFormRotationNumber(form));

  return (
    <DataListItem>
      <DataListItemHeader title={rotationLabel} />
      <DataListField label="Buddy">{form.buddyName}</DataListField>
      <DataListField label="JC">{form.juniorCommanderName}</DataListField>
      <DataListField label="Age Group">{getAgeGroupLabel(form.ageGroup)}</DataListField>
      <DataListField label="Next Rotation Preference">
        {form.nextRotationPreference ? (
          getAgeGroupLabel(form.nextRotationPreference)
        ) : (
          <span className="text-muted-foreground">Pending</span>
        )}
      </DataListField>
      <DataListField label="Status">
        <div className="space-y-1.5">
          <ReviewFormStatusBadge status={form.status} />
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1">
            <span className="text-xs text-muted-foreground">JC:</span>
            <ReviewFormJCProgressBadge form={form} />
            <span className="text-xs text-muted-foreground">Buddy:</span>
            <ReviewFormBuddyProgressBadge form={form} />
          </div>
        </div>
      </DataListField>
      <DataListField label="Visibility">
        <ReviewFormVisibilityToggle form={form} />
      </DataListField>
      <DataListItemFooter className="justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="mr-1 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCopyBuddy(form)} className="cursor-pointer">
              {copiedToken === `${form._id}-buddy` ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy Buddy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyJC(form)} className="cursor-pointer">
              {copiedToken === `${form._id}-jc` ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy JC Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/app/review/${form._id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Form
              </Link>
            </DropdownMenuItem>
            {showArchiveAction && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onArchive(form)}
                  disabled={archivingFormId === form._id}
                  className="cursor-pointer"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {archivingFormId === form._id ? 'Archiving...' : 'Archive Form'}
                </DropdownMenuItem>
              </>
            )}
            {showUnarchiveAction && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUnarchive(form)}
                  disabled={archivingFormId === form._id}
                  className="cursor-pointer"
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  {archivingFormId === form._id ? 'Restoring...' : 'Restore Form'}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(form)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DataListItemFooter>
    </DataListItem>
  );
}
