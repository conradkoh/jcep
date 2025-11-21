'use client';

import { ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReviewForm } from '../types';

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
  const progressPercentage = (completedSections / totalSections) * 100;

  const formatDate = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  };

  const getStatusBadge = () => {
    switch (form.status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/20">
            Draft
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
            In Progress
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Submitted
          </Badge>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{form.juniorCommanderName}</h3>
            <p className="text-sm text-muted-foreground">Buddy: {form.buddyName}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">{form.ageGroup}</span>
          <span>•</span>
          <span>{formatDate(form.evaluationDate)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium text-foreground">
              {completedSections}/{totalSections} sections
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/app/review/${form._id}`}>
            View Form
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
