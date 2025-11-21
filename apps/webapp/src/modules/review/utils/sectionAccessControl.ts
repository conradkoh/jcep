/**
 * Section Access Control Utilities
 * Centralized logic for determining which sections are available to users
 */

import type { ReviewForm } from '../types';

export type AccessLevel = 'buddy' | 'jc' | 'admin' | 'none';

export interface SectionAccessRules {
  canAccessBuddyEvaluation: boolean;
  canAccessJCReflection: boolean;
  canAccessJCFeedback: boolean;
  canEditBuddyEvaluation: boolean;
  canEditJCReflection: boolean;
  canEditJCFeedback: boolean;
}

/**
 * Determine section access rules based on user's access level and form state
 *
 * @param accessLevel - The user's access level (buddy, jc, admin, none)
 * @param form - The review form
 * @returns Section access rules
 *
 * @remarks
 * Current logic (will be improved later):
 * - Buddy can access and edit Buddy Evaluation section
 * - JC can access and edit JC Reflection and JC Feedback sections
 * - Admin can access all sections but cannot edit via token access
 * - All sections are locked when form is submitted
 */
export function getSectionAccessRules(
  accessLevel: AccessLevel,
  form: ReviewForm
): SectionAccessRules {
  const isSubmitted = form.status === 'submitted';

  // Default: no access
  const rules: SectionAccessRules = {
    canAccessBuddyEvaluation: false,
    canAccessJCReflection: false,
    canAccessJCFeedback: false,
    canEditBuddyEvaluation: false,
    canEditJCReflection: false,
    canEditJCFeedback: false,
  };

  // Admin can see everything but not edit via token
  if (accessLevel === 'admin') {
    rules.canAccessBuddyEvaluation = true;
    rules.canAccessJCReflection = true;
    rules.canAccessJCFeedback = true;
    // Admin can edit through authenticated session, not token
    return rules;
  }

  // Buddy access
  if (accessLevel === 'buddy') {
    rules.canAccessBuddyEvaluation = true;
    rules.canEditBuddyEvaluation = !isSubmitted;
  }

  // JC access
  if (accessLevel === 'jc') {
    rules.canAccessJCReflection = true;
    rules.canAccessJCFeedback = true;
    rules.canEditJCReflection = !isSubmitted;
    rules.canEditJCFeedback = !isSubmitted;
  }

  return rules;
}

/**
 * Check if a section should be locked (not accessible)
 */
export function isSectionLocked(canAccess: boolean): boolean {
  return !canAccess;
}

/**
 * Get a user-friendly message for why a section is locked
 */
export function getSectionLockMessage(
  section: 'buddy' | 'jc-reflection' | 'jc-feedback',
  accessLevel: AccessLevel
): string {
  if (accessLevel === 'buddy') {
    if (section === 'buddy') {
      return 'You have access to this section';
    }
    return 'This section is only accessible to the Junior Commander';
  }

  if (accessLevel === 'jc') {
    if (section === 'buddy') {
      return 'This section is only accessible to the Buddy';
    }
    return 'You have access to this section';
  }

  if (accessLevel === 'admin') {
    return 'View-only access as administrator';
  }

  return 'You do not have access to this section';
}
