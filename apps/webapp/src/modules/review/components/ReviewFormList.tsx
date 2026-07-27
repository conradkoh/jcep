'use client';

import { FileText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { REVIEWS_MANAGE_PERMISSION, useHasPermission } from '@/application/auth';
import { useReviewFormsByYear } from '../hooks/useReviewForm';
import { ReviewFormCard } from './ReviewFormCard';

interface ReviewFormListProps {
  year: number;
}

export function ReviewFormList({ year }: ReviewFormListProps) {
  const { forms, isLoading } = useReviewFormsByYear(year);
  const canManageReviews = useHasPermission(REVIEWS_MANAGE_PERMISSION);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading review forms…
        </p>
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
        {canManageReviews ? (
          <ShieldCheck className="h-12 w-12 text-muted-foreground" aria-hidden />
        ) : (
          <FileText className="h-12 w-12 text-muted-foreground" aria-hidden />
        )}
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Review Forms</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {canManageReviews
            ? 'You don\u2019t have any personal review forms as a mentor. Manage all forms in'
            : `You don\u2019t have any review forms for ${year} yet.`}
        </p>
        {canManageReviews && (
          <Link
            href="/app/review-management"
            className="mt-4 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Review Management
          </Link>
        )}
      </div>
    );
  }

  return (
    <section aria-label={`Review forms for ${year}`} className="space-y-4">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {forms.map((form) => (
          <li key={form._id} className="h-full">
            <ReviewFormCard form={form} />
          </li>
        ))}
      </ul>
    </section>
  );
}
