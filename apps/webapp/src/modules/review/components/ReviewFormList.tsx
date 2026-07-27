'use client';

import { FileText } from 'lucide-react';

import { ReviewFormCard } from './ReviewFormCard';
import { useReviewFormsByYear } from '../hooks/useReviewForm';

interface ReviewFormListProps {
  year: number;
  rotationNumber?: number;
  selectedRotation?: string;
}

export function ReviewFormList({
  year,
  rotationNumber,
  selectedRotation = 'all',
}: ReviewFormListProps) {
  const { forms, isLoading } = useReviewFormsByYear(year, rotationNumber);

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
        <FileText className="h-12 w-12 text-muted-foreground" aria-hidden />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Review Forms</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedRotation !== 'all'
            ? `You don\u2019t have any review forms for ${year} Rotation ${selectedRotation}.`
            : `You don\u2019t have any review forms for ${year} yet.`}
        </p>
      </div>
    );
  }

  const rotationLabel = selectedRotation !== 'all' ? ` Rotation ${selectedRotation}` : '';

  return (
    <section aria-label={`Review forms for ${year}${rotationLabel}`} className="space-y-4">
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
