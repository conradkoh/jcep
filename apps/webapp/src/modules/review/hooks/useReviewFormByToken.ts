/**
 * Hook for accessing review forms via access token (anonymous access)
 */

import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import type {
  ReviewForm,
  SectionCompletion,
  TokenAccessLevel,
  TokenAccessResponse,
} from '../types';
import {
  isBuddyEvaluationComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from '../utils/sectionCompletionHelpers';

export interface ReviewFormByTokenReturn {
  form: ReviewForm | null | undefined;
  accessLevel: TokenAccessLevel | null;
  isLoading: boolean;
  sectionCompletion: SectionCompletion;
  canEditParticulars: boolean;
  canEditBuddyEvaluation: boolean;
  canEditJCReflection: boolean;
  canEditJCFeedback: boolean;
}

/**
 * Hook to get a review form by access token
 */
export function useReviewFormByToken(
  accessToken: string | null | undefined
): ReviewFormByTokenReturn {
  const response = useQuery(
    api.reviewForms.getReviewFormByToken,
    accessToken ? { accessToken } : 'skip'
  ) as TokenAccessResponse | undefined | null;

  const form = response?.form;
  const accessLevel = response?.accessLevel ?? null;

  const sectionCompletion = useMemo<SectionCompletion>(() => {
    if (!form) {
      return {
        particulars: false,
        buddyEvaluation: false,
        jcReflection: false,
        jcFeedback: false,
      };
    }

    const buddyComplete = isBuddyEvaluationComplete(form);
    const jcReflectionComplete = isJCReflectionComplete(form);
    const jcFeedbackComplete = isJCFeedbackComplete(form);

    return {
      particulars: true, // Always true if form exists
      buddyEvaluation: buddyComplete,
      jcReflection: jcReflectionComplete,
      jcFeedback: jcFeedbackComplete,
    };
  }, [form]);

  const canEditParticulars = useMemo(() => {
    if (!form || !accessLevel) return false;
    // Only admins can edit particulars (not available via token)
    return false;
  }, [form, accessLevel]);

  const canEditBuddyEvaluation = useMemo(() => {
    if (!form || !accessLevel) return false;
    // Buddy can edit their evaluation
    if (accessLevel === 'buddy') return true;
    return false;
  }, [form, accessLevel]);

  const canEditJCReflection = useMemo(() => {
    if (!form || !accessLevel) return false;
    // JC can edit their reflection
    if (accessLevel === 'jc') return true;
    return false;
  }, [form, accessLevel]);

  const canEditJCFeedback = useMemo(() => {
    if (!form || !accessLevel) return false;
    // JC can edit their feedback
    if (accessLevel === 'jc') return true;
    return false;
  }, [form, accessLevel]);

  return {
    form,
    accessLevel,
    isLoading: response === undefined,
    sectionCompletion,
    canEditParticulars,
    canEditBuddyEvaluation,
    canEditJCReflection,
    canEditJCFeedback,
  };
}
