'use client';

import { ChevronRight, Users } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReviewForm } from '../types';
import { getAgeGroupLabel } from '../utils/ageGroupLabels';

interface ReviewFormCardProps {
  form: ReviewForm;
}

export function ReviewFormCard({ form }: ReviewFormCardProps) {
  const completedSections = [
    form.buddyEvaluation !== null,
    form.jcReflection !== null,
    form.jcFeedback !== null,
  ].filter(Boolean).length;
  const totalSections = 3;
  const progressPercentage = Math.round((completedSections / totalSections) * 100);

  const formatDate = (timestamp: number) => DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  const ageGroupLabel = getAgeGroupLabel(form.ageGroup);

  const titleId = useId();
  const statusId = useId();
  const progressId = useId();

  const statusCopy = (() => {
    switch (form.status) {
      case 'draft':
        return { label: 'Draft', className: 'bg-muted text-muted-foreground' };
      case 'in_progress':
        return { label: 'In Progress', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30' };
      case 'submitted':
        return { label: 'Submitted', className: 'bg-green-50 text-green-700 dark:bg-green-950/30' };
      default:
        return { label: form.status, className: 'bg-muted text-muted-foreground' };
    }
  })();

  return (
    <Card className="flex h-full flex-col border-border transition-colors hover:border-accent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden />
              <span>Junior Commander</span>
            </div>
            <h3 id={titleId} className="text-lg font-semibold text-foreground">
              {form.juniorCommanderName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Buddy <span className="text-foreground">· {form.buddyName}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <Badge
              id={statusId}
              variant="outline"
              className={`${statusCopy.className} border-transparent px-2 py-1 text-xs font-medium`}
            >
              {statusCopy.label}
            </Badge>
            <Badge variant="secondary" className="bg-accent/40 text-xs text-muted-foreground">
              {ageGroupLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{ageGroupLabel}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(form.evaluationDate)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Sections completed</span>
            <span className="font-medium text-foreground">
              {completedSections}/{totalSections}
            </span>
          </div>
          <Progress
            id={progressId}
            value={progressPercentage}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Form ${progressPercentage}% complete`}
            className="h-2"
          />
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-2">
        <Button asChild variant="secondary" className="w-full justify-between">
          <Link
            href={`/app/review/${form._id}`}
            aria-labelledby={`${titleId} ${statusId}`}
            aria-describedby={progressId}
          >
            Open form
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
