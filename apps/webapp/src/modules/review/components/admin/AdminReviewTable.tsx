'use client';

import { ExternalLink } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ReviewForm } from '../../types';

interface AdminReviewTableProps {
  forms: ReviewForm[];
}

export function AdminReviewTable({ forms }: AdminReviewTableProps) {
  const formatDate = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  };

  const getStatusBadge = (status: ReviewForm['status']) => {
    switch (status) {
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

  const getCompletionStatus = (form: ReviewForm) => {
    const completed = [
      form.buddyEvaluation !== null,
      form.jcReflection !== null,
      form.jcFeedback !== null,
    ].filter(Boolean).length;
    return `${completed}/3`;
  };

  if (forms.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No forms found matching the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Junior Commander</TableHead>
            <TableHead>Buddy</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead>Evaluation Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form._id}>
              <TableCell className="font-medium">{form.juniorCommanderName}</TableCell>
              <TableCell>{form.buddyName}</TableCell>
              <TableCell>{form.ageGroup}</TableCell>
              <TableCell>{formatDate(form.evaluationDate)}</TableCell>
              <TableCell>{getStatusBadge(form.status)}</TableCell>
              <TableCell>{getCompletionStatus(form)}</TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/app/review/${form._id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
