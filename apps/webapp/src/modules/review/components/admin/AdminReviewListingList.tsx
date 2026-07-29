'use client';

import { AdminReviewListingListItem } from './AdminReviewListingListItem';
import type { ReviewForm } from '../../types';

import { DataList } from '@/components/ui/data-list';

export interface AdminReviewListingListProps {
  forms: ReviewForm[];
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

export function AdminReviewListingList({ forms, ...itemProps }: AdminReviewListingListProps) {
  return (
    <DataList>
      {forms.map((form) => (
        <AdminReviewListingListItem key={form._id} form={form} {...itemProps} />
      ))}
    </DataList>
  );
}
