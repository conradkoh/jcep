'use client';

import { ExternalLink, Trash2 } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useDeleteReviewForm } from '../../hooks/useReviewForm';
import type { ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { formatRotationLabel } from '../../utils/rotationUtils';

interface AdminReviewTableProps {
  forms: ReviewForm[];
  onFormDeleted?: () => void;
}

export function AdminReviewTable({ forms, onFormDeleted }: AdminReviewTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ReviewForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteReviewForm = useDeleteReviewForm();
  const formatDate = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  };

  const getStatusBadge = (status: ReviewForm['status']) => {
    switch (status) {
      case 'not_started':
        return (
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/20">
            Not Started
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
            In Progress
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Complete
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

  const handleDeleteClick = (form: ReviewForm) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    setIsDeleting(true);
    try {
      await deleteReviewForm(formToDelete._id);
      toast.success('Review form deleted successfully');
      setDeleteDialogOpen(false);
      setFormToDelete(null);
      onFormDeleted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete review form');
    } finally {
      setIsDeleting(false);
    }
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
              <TableCell>{getAgeGroupLabel(form.ageGroup)}</TableCell>
              <TableCell>{formatDate(form.evaluationDate)}</TableCell>
              <TableCell>{getStatusBadge(form.status)}</TableCell>
              <TableCell>{getCompletionStatus(form)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    aria-label={`Open form for ${form.juniorCommanderName}`}
                  >
                    <Link href={`/app/review/${form._id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(form)}
                    title="Delete Form"
                    aria-label={`Delete form for ${form.juniorCommanderName}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review Form?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the review form for{' '}
              <strong>{formToDelete?.juniorCommanderName}</strong> and{' '}
              <strong>{formToDelete?.buddyName}</strong> (
              {formToDelete &&
                formatRotationLabel(formToDelete.rotationYear, formToDelete.rotationQuarter)}
              )?
              <br />
              <br />
              This action cannot be undone. All responses and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
