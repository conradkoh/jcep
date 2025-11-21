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
 * Access logic with visibility control:
 * - Buddy can always access and edit their own Buddy Evaluation section
 * - Buddy can VIEW JC sections if admin enables jcResponsesVisibleToBuddy
 * - JC can always access and edit their own JC Reflection and Feedback sections
 * - JC can VIEW Buddy Evaluation if admin enables buddyResponsesVisibleToJC
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
    // Buddy can always access their own evaluation
    rules.canAccessBuddyEvaluation = true;
    rules.canEditBuddyEvaluation = !isSubmitted;

    // Buddy can VIEW JC sections if visibility is enabled
    if (form.jcResponsesVisibleToBuddy) {
      rules.canAccessJCReflection = true;
      rules.canAccessJCFeedback = true;
      // Buddy can only view, not edit JC sections
    }
  }

  // JC access
  if (accessLevel === 'jc') {
    // JC can always access their own sections
    rules.canAccessJCReflection = true;
    rules.canAccessJCFeedback = true;
    rules.canEditJCReflection = !isSubmitted;
    rules.canEditJCFeedback = !isSubmitted;

    // JC can VIEW Buddy Evaluation if visibility is enabled
    if (form.buddyResponsesVisibleToJC) {
      rules.canAccessBuddyEvaluation = true;
      // JC can only view, not edit Buddy section
    }
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
    return 'This section will be visible once the administrator enables visibility';
  }

  if (accessLevel === 'jc') {
    if (section === 'buddy') {
      return 'This section will be visible once the administrator enables visibility';
    }
    return 'You have access to this section';
  }

  if (accessLevel === 'admin') {
    return 'View-only access as administrator';
  }

  return 'You do not have access to this section';
}
