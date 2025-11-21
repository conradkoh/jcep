/**
 * Admin Review Listing Table
 * Shows all review forms with token copy buttons and participant status
 */

'use client';

import { Check, Copy, ExternalLink, Eye, EyeOff, MoreVertical, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteReviewForm, useToggleResponseVisibility } from '../../hooks/useReviewForm';
import type { ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { formatRotationLabel } from '../../utils/rotationUtils';
import {
  isBuddyEvaluationComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from '../../utils/sectionCompletionHelpers';

interface AdminReviewListingTableProps {
  forms: ReviewForm[];
  onFormDeleted?: () => void;
}

export function AdminReviewListingTable({ forms, onFormDeleted }: AdminReviewListingTableProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ReviewForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
  const deleteReviewForm = useDeleteReviewForm();
  const toggleVisibility = useToggleResponseVisibility();

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

  const getBuddyProgress = (form: ReviewForm) => {
    const isComplete = isBuddyEvaluationComplete(form);

    if (!form.buddyEvaluation) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
        >
          Not Started
        </Badge>
      );
    }

    if (isComplete) {
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
        In Progress
      </Badge>
    );
  };

  const getJCProgress = (form: ReviewForm) => {
    const reflectionComplete = isJCReflectionComplete(form);
    const feedbackComplete = isJCFeedbackComplete(form);
    const hasReflection = form.jcReflection !== null;
    const hasFeedback = form.jcFeedback !== null;

    // Not started: neither section exists
    if (!hasReflection && !hasFeedback) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
        >
          Not Started
        </Badge>
      );
    }

    // Both complete
    if (reflectionComplete && feedbackComplete) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
        >
          Completed
        </Badge>
      );
    }

    // In progress: at least one section exists but not both complete
    const completed = [reflectionComplete, feedbackComplete].filter(Boolean).length;
    const total = 2;
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

  const handleToggleBuddyVisibility = async (form: ReviewForm) => {
    const key = `${form._id}-buddy`;
    setTogglingVisibility(key);
    try {
      await toggleVisibility({
        formId: form._id,
        buddyResponsesVisibleToJC: !form.buddyResponsesVisibleToJC,
      });
      toast.success(
        !form.buddyResponsesVisibleToJC
          ? 'Buddy responses now visible to JC'
          : 'Buddy responses now hidden from JC'
      );
    } catch (error) {
      toast.error('Failed to update visibility');
      console.error(error);
    } finally {
      setTogglingVisibility(null);
    }
  };

  const handleToggleJCVisibility = async (form: ReviewForm) => {
    const key = `${form._id}-jc`;
    setTogglingVisibility(key);
    try {
      await toggleVisibility({
        formId: form._id,
        jcResponsesVisibleToBuddy: !form.jcResponsesVisibleToBuddy,
      });
      toast.success(
        !form.jcResponsesVisibleToBuddy
          ? 'JC responses now visible to Buddy'
          : 'JC responses now hidden from Buddy'
      );
    } catch (error) {
      toast.error('Failed to update visibility');
      console.error(error);
    } finally {
      setTogglingVisibility(null);
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
              <TableHead>Next Rotation Preference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Visibility</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form._id}>
                <TableCell className="font-medium">
                  {formatRotationLabel(form.rotationYear, form.rotationQuarter)}
                </TableCell>
                <TableCell>{form.buddyName}</TableCell>
                <TableCell>{form.juniorCommanderName}</TableCell>
                <TableCell>{getAgeGroupLabel(form.ageGroup)}</TableCell>
                <TableCell>
                  {form.nextRotationPreference ? (
                    getAgeGroupLabel(form.nextRotationPreference)
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <div>{getStatusBadge(form.status)}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">JC:</span>
                      {getJCProgress(form)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Buddy:</span>
                      {getBuddyProgress(form)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBuddyVisibility(form)}
                        disabled={togglingVisibility === `${form._id}-buddy`}
                        className="h-7 px-2"
                        aria-label={`Toggle Buddy visibility for ${form.juniorCommanderName}`}
                      >
                        {form.buddyResponsesVisibleToJC ? (
                          <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-1.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                        )}
                        <span className="text-xs">Buddy → JC</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleJCVisibility(form)}
                        disabled={togglingVisibility === `${form._id}-jc`}
                        className="h-7 px-2"
                        aria-label={`Toggle JC visibility for ${form.juniorCommanderName}`}
                      >
                        {form.jcResponsesVisibleToBuddy ? (
                          <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-1.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                        )}
                        <span className="text-xs">JC → Buddy</span>
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(form.buddyAccessToken, 'buddy', form._id)}
                          className="cursor-pointer"
                        >
                          {copiedToken === `${form._id}-buddy` ? (
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          Copy Buddy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(form.jcAccessToken, 'jc', form._id)}
                          className="cursor-pointer"
                        >
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(form)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
