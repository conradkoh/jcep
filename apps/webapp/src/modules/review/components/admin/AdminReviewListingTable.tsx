/**
 * Admin Review Listing Table
 * Displays all review forms in a table with status, visibility controls, and action menu.
 * Provides admin functionality for managing review forms including copying access links,
 * toggling response visibility, viewing forms, archiving/unarchiving, and deleting forms.
 */

'use client';

import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  useArchiveReviewForm,
  useDeleteReviewForm,
  useUnarchiveReviewForm,
} from '../../hooks/useReviewForm';
import type { ReviewForm } from '../../types';
import { formatRotationLabel, getReviewFormRotationNumber } from '../../utils/rotationUtils';
import {
  ReviewFormBuddyProgressBadge,
  ReviewFormJCProgressBadge,
} from '../ReviewFormProgressBadges';
import { ReviewFormStatusBadge } from '../ReviewFormStatusBadge';
import { ReviewFormVisibilityToggle } from '../ReviewFormVisibilityToggle';
import { AdminReviewListingList } from './AdminReviewListingList';

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
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

/**
 * Props for the AdminReviewListingTable component.
 */
export interface AdminReviewListingTableProps {
  /** Array of review forms to display in the table */
  forms: ReviewForm[];
  /** Optional callback fired when a form is deleted */
  onFormDeleted?: () => void;
  /** Whether to show the archive action in the dropdown menu */
  showArchiveAction?: boolean;
  /** Whether to show the unarchive action in the dropdown menu */
  showUnarchiveAction?: boolean;
}

/**
 * Admin table component displaying all review forms with management controls.
 *
 * @example
 * ```tsx
 * <AdminReviewListingTable
 *   forms={reviewForms}
 *   onFormDeleted={() => refetchForms()}
 *   showArchiveAction
 * />
 * ```
 */
export function AdminReviewListingTable({
  forms,
  onFormDeleted,
  showArchiveAction,
  showUnarchiveAction,
}: AdminReviewListingTableProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ReviewForm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [archivingFormId, setArchivingFormId] = useState<string | null>(null);
  const deleteReviewForm = useDeleteReviewForm();
  const archiveReviewForm = useArchiveReviewForm();
  const unarchiveReviewForm = useUnarchiveReviewForm();

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
   * Archives a review form.
   * @param form - The review form to archive
   */
  const handleArchive = useCallback(
    async (form: ReviewForm) => {
      setArchivingFormId(form._id);
      try {
        await archiveReviewForm(form._id);
        toast.success('Form archived successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to archive form');
      } finally {
        setArchivingFormId(null);
      }
    },
    [archiveReviewForm]
  );

  /**
   * Unarchives a review form.
   * @param form - The review form to unarchive
   */
  const handleUnarchive = useCallback(
    async (form: ReviewForm) => {
      setArchivingFormId(form._id);
      try {
        await unarchiveReviewForm(form._id);
        toast.success('Form restored to active');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to restore form');
      } finally {
        setArchivingFormId(null);
      }
    },
    [unarchiveReviewForm]
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
      <div className="hidden md:block overflow-x-auto">
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
                  {formatRotationLabel(form.rotationYear, getReviewFormRotationNumber(form))}
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
                    <div>
                      <ReviewFormStatusBadge status={form.status} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
                      <span className="text-xs text-muted-foreground">JC:</span>
                      <div>
                        <ReviewFormJCProgressBadge form={form} />
                      </div>
                      <span className="text-xs text-muted-foreground">Buddy:</span>
                      <div>
                        <ReviewFormBuddyProgressBadge form={form} />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <ReviewFormVisibilityToggle form={form} />
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
                        {showArchiveAction && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleArchive(form)}
                              disabled={archivingFormId === form._id}
                              className="cursor-pointer"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {archivingFormId === form._id ? 'Archiving...' : 'Archive Form'}
                            </DropdownMenuItem>
                          </>
                        )}
                        {showUnarchiveAction && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUnarchive(form)}
                              disabled={archivingFormId === form._id}
                              className="cursor-pointer"
                            >
                              <ArchiveRestore className="mr-2 h-4 w-4" />
                              {archivingFormId === form._id ? 'Restoring...' : 'Restore Form'}
                            </DropdownMenuItem>
                          </>
                        )}
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

      <div className="md:hidden p-3">
        <AdminReviewListingList
          forms={forms}
          copiedToken={copiedToken}
          showArchiveAction={showArchiveAction}
          showUnarchiveAction={showUnarchiveAction}
          archivingFormId={archivingFormId}
          onCopyBuddy={(form) => copyToClipboard(form.buddyAccessToken, 'buddy', form._id)}
          onCopyJC={(form) => copyToClipboard(form.jcAccessToken, 'jc', form._id)}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onDelete={handleDeleteClick}
        />
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
                formatRotationLabel(
                  formToDelete.rotationYear,
                  getReviewFormRotationNumber(formToDelete)
                )}
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
