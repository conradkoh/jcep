import type { Doc, Id } from '../_generated/dataModel';

type ReviewFormForPersonalAccess = Pick<
  Doc<'reviewForms'>,
  'buddyUserId' | 'createdBy' | 'rotationParticipantId' | 'juniorCommanderUserId'
>;

/**
 * Admin-generated rotation forms where the admin was incorrectly assigned as buddy.
 * Matches migration clearMisassignedBuddyOnReviewForms heuristic.
 */
export function isMisassignedAdminBuddyForm(
  form: ReviewFormForPersonalAccess,
  userId: Id<'users'>
): boolean {
  return (
    form.buddyUserId === userId &&
    form.createdBy === userId &&
    form.rotationParticipantId !== undefined
  );
}

/**
 * Filter buddy forms for personal review list — excludes misassigned admin buddies.
 */
export function filterBuddyFormsForPersonalAccess<T extends ReviewFormForPersonalAccess>(
  forms: T[],
  userId: Id<'users'>
): T[] {
  return forms.filter((form) => !isMisassignedAdminBuddyForm(form, userId));
}
