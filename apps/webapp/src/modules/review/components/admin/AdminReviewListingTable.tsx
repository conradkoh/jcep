/**
 * Admin Review Listing Table
 * Displays all review forms in a table with status, visibility controls, and action menu.
 * Provides admin functionality for managing review forms including copying access links,
 * toggling response visibility, viewing forms, and deleting forms.
 */

'use client';

import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteReviewForm, useToggleResponseVisibility } from '../../hooks/useReviewForm';
import type { ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { formatRotationLabel } from '../../utils/rotationUtils';
import {
  isBuddyEvaluationComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from '../../utils/sectionCompletionHelpers';

/**
 * Props for the AdminReviewListingTable component.
 */
export interface AdminReviewListingTableProps {
  /** Array of review forms to display in the table */
  forms: ReviewForm[];
  /** Optional callback fired when a form is deleted */
  onFormDeleted?: () => void;
}

/**
 * Combined visibility state for a review form.
 */
interface _CombinedVisibilityState {
  /** Whether the form should be displayed as visible (both visible OR mismatched) */
  isVisible: boolean;
  /** Whether visibility settings are mismatched (one visible, one hidden) */
  isMismatched: boolean;
  /** Whether buddy responses are visible to JC */
  buddyVisible: boolean;
  /** Whether JC responses are visible to Buddy */
  jcVisible: boolean;
}

/**
 * Admin table component displaying all review forms with management controls.
 *
 * @example
 * ```tsx
 * <AdminReviewListingTable
 *   forms={reviewForms}
 *   onFormDeleted={() => refetchForms()}
 * />
 * ```
 */
export function AdminReviewListingTable({ forms, onFormDeleted }: AdminReviewListingTableProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ReviewForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
  const deleteReviewForm = useDeleteReviewForm();
  const toggleVisibility = useToggleResponseVisibility();

  /**
   * Copies an access token link to the clipboard.
   * @param token - The access token to create a link for
   * @param type - Type of token ('buddy' or 'jc')
   * @param formId - The form ID for tracking copied state
   */
  const copyToClipboard = useCallback(
    async (token: string, type: 'buddy' | 'jc', formId: string) => {
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
    },
    []
  );

  /**
   * Opens the delete confirmation dialog for a form.
   * @param form - The review form to delete
   */
  const handleDeleteClick = useCallback((form: ReviewForm) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Confirms and executes the deletion of a review form.
   */
  const handleDeleteConfirm = useCallback(async () => {
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
  }, [formToDelete, deleteReviewForm, onFormDeleted]);

  /**
   * Toggles both visibility settings simultaneously.
   * If both are visible, hides both; otherwise shows both.
   * @param form - The review form to update
   */
  const handleToggleBothVisibility = useCallback(
    async (form: ReviewForm) => {
      const key = `${form._id}-both`;
      setTogglingVisibility(key);
      try {
        const bothVisible = form.buddyResponsesVisibleToJC && form.jcResponsesVisibleToBuddy;
        await toggleVisibility({
          formId: form._id,
          buddyResponsesVisibleToJC: !bothVisible,
          jcResponsesVisibleToBuddy: !bothVisible,
        });
        toast.success(!bothVisible ? 'Both responses now visible' : 'Both responses now hidden');
      } catch (error) {
        toast.error('Failed to update visibility');
        console.error(error);
      } finally {
        setTogglingVisibility(null);
      }
    },
    [toggleVisibility]
  );

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
              <TableHead>Rotation</TableHead>
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
                    <div>{_getStatusBadge(form.status)}</div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
                      <span className="text-xs text-muted-foreground">JC:</span>
                      <div>{_getJCProgress(form)}</div>
                      <span className="text-xs text-muted-foreground">Buddy:</span>
                      <div>{_getBuddyProgress(form)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleBothVisibility(form)}
                            disabled={togglingVisibility === `${form._id}-both`}
                            className="h-7 px-2"
                            aria-label={`Toggle visibility for ${form.juniorCommanderName}`}
                          >
                            {(() => {
                              const visibility = _getCombinedVisibilityState(form);
                              if (visibility.isMismatched) {
                                return (
                                  <>
                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mr-1.5" />
                                    <span className="text-xs">Partial</span>
                                  </>
                                );
                              }
                              if (visibility.isVisible) {
                                return (
                                  <>
                                    <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-1.5" />
                                    <span className="text-xs">Visible</span>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                  <span className="text-xs">Hidden</span>
                                </>
                              );
                            })()}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {(() => {
                            const visibility = _getCombinedVisibilityState(form);
                            if (visibility.isMismatched) {
                              return (
                                <div className="text-xs space-y-1">
                                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                                    Warning: Visibility settings are mismatched
                                  </p>
                                  <p>
                                    Buddy → JC: {visibility.buddyVisible ? 'Visible' : 'Hidden'}
                                  </p>
                                  <p>JC → Buddy: {visibility.jcVisible ? 'Visible' : 'Hidden'}</p>
                                  <p className="mt-1">Click to sync both settings</p>
                                </div>
                              );
                            }
                            return (
                              <p className="text-xs">
                                {visibility.isVisible
                                  ? 'Both responses are visible. Click to hide both.'
                                  : 'Both responses are hidden. Click to show both.'}
                              </p>
                            );
                          })()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

/**
 * Returns a badge component representing the form's overall status.
 * @param status - The review form status
 * @returns Badge component with appropriate styling
 */
function _getStatusBadge(status: ReviewForm['status']): JSX.Element {
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
}

/**
 * Returns a badge component representing the buddy's evaluation progress.
 * @param form - The review form to check
 * @returns Badge component showing buddy progress status
 */
function _getBuddyProgress(form: ReviewForm): JSX.Element {
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
}

/**
 * Returns a badge component representing the JC's reflection and feedback progress.
 * @param form - The review form to check
 * @returns Badge component showing JC progress status
 */
function _getJCProgress(form: ReviewForm): JSX.Element {
  const reflectionComplete = isJCReflectionComplete(form);
  const feedbackComplete = isJCFeedbackComplete(form);
  const hasReflection = form.jcReflection !== null;
  const hasFeedback = form.jcFeedback !== null;

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
}

/**
 * Calculates the combined visibility state for a review form.
 * Determines if visibility settings are synchronized or mismatched.
 * @param form - The review form to analyze
 * @returns Combined visibility state object
 */
function _getCombinedVisibilityState(form: ReviewForm): _CombinedVisibilityState {
  const bothVisible = form.buddyResponsesVisibleToJC && form.jcResponsesVisibleToBuddy;
  const bothHidden = !form.buddyResponsesVisibleToJC && !form.jcResponsesVisibleToBuddy;
  const mismatched = !bothVisible && !bothHidden;

  return {
    isVisible: bothVisible || mismatched,
    isMismatched: mismatched,
    buddyVisible: form.buddyResponsesVisibleToJC,
    jcVisible: form.jcResponsesVisibleToBuddy,
  };
}
