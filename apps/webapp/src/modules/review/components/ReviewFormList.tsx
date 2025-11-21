'use client';

import { FileText } from 'lucide-react';
import { useReviewFormsByYear } from '../hooks/useReviewForm';
import { ReviewFormCard } from './ReviewFormCard';

interface ReviewFormListProps {
  year: number;
}

export function ReviewFormList({ year }: ReviewFormListProps) {
  const { forms, isLoading } = useReviewFormsByYear(year);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading forms...</p>
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-12">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Review Forms</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You don't have any review forms for {year} yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <ReviewFormCard key={form._id} form={form} />
      ))}
    </div>
  );
}
