/**
 * Admin Review Listing Table
 * Shows all review forms with token copy buttons and participant status
 */

'use client';

import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
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

interface AdminReviewListingTableProps {
  forms: ReviewForm[];
  onFormDeleted?: () => void;
}

export function AdminReviewListingTable({ forms, onFormDeleted }: AdminReviewListingTableProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ReviewForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteReviewForm = useDeleteReviewForm();

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

  const getBuddyProgress = (form: ReviewForm) => {
    if (form.buddyEvaluation === null) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
        >
          Not Started
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
      >
        Completed
      </Badge>
    );
  };

  const getJCProgress = (form: ReviewForm) => {
    const completed = [form.jcReflection !== null, form.jcFeedback !== null].filter(Boolean).length;
    const total = 2;

    if (completed === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
        >
          Not Started
        </Badge>
      );
    }
    if (completed === total) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
      >
        {completed}/{total} Sections
      </Badge>
    );
  };

  const copyToClipboard = async (token: string, type: 'buddy' | 'jc', formId: string) => {
    const link = `${window.location.origin}/review/token/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(`${formId}-${type}`);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success(`${type === 'buddy' ? 'Buddy' : 'JC'} link copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy link');
      console.error(error);
    }
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Buddy</TableHead>
              <TableHead>JC</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Buddy Progress</TableHead>
              <TableHead>JC Progress</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form._id}>
                <TableCell className="font-medium">{form.rotationYear}</TableCell>
                <TableCell>{form.buddyName}</TableCell>
                <TableCell>{form.juniorCommanderName}</TableCell>
                <TableCell>{getAgeGroupLabel(form.ageGroup)}</TableCell>
                <TableCell>{getStatusBadge(form.status)}</TableCell>
                <TableCell>{getBuddyProgress(form)}</TableCell>
                <TableCell>{getJCProgress(form)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(form.buddyAccessToken, 'buddy', form._id)}
                      title="Copy Buddy Link"
                      aria-label={`Copy buddy link for ${form.juniorCommanderName}`}
                    >
                      {copiedToken === `${form._id}-buddy` ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-1 text-xs">Buddy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(form.jcAccessToken, 'jc', form._id)}
                      title="Copy JC Link"
                      aria-label={`Copy Junior Commander link for ${form.juniorCommanderName}`}
                    >
                      {copiedToken === `${form._id}-jc` ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-1 text-xs">JC</span>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      title="View Form"
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
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review Form?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the review form for{' '}
              <strong>{formToDelete?.juniorCommanderName}</strong> and{' '}
              <strong>{formToDelete?.buddyName}</strong> ({formToDelete?.rotationYear})?
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
