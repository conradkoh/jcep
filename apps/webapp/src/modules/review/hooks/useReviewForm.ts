/**
 * Main data access hook for JCEP Review Forms
 */

import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { useMemo } from 'react';
import type {
  AllReviewFormsReturn,
  CreateReviewFormParams,
  CreateReviewFormResponse,
  RegenerateTokensResponse,
  ReviewForm,
  ReviewFormHookReturn,
  ReviewFormsByYearReturn,
  SectionCompletion,
  UpdateBuddyEvaluationParams,
  UpdateJCFeedbackParams,
  UpdateJCReflectionParams,
  UpdateParticularsParams,
} from '../types';

/**
 * Hook to get a single review form with computed state
 */
export function useReviewForm(formId: Id<'reviewForms'> | null | undefined): ReviewFormHookReturn {
  const form = useSessionQuery(api.reviewForms.getReviewForm, formId ? { formId } : 'skip') as
    | ReviewForm
    | undefined
    | null;

  const authState = useSessionQuery(api.auth.getState, {});
  const currentUserId = authState?.state === 'authenticated' ? authState.user._id : undefined;

  const sectionCompletion = useMemo<SectionCompletion>(() => {
    if (!form) {
      return {
        particulars: false,
        buddyEvaluation: false,
        jcReflection: false,
        jcFeedback: false,
      };
    }

    return {
      particulars: true, // Always true if form exists
      buddyEvaluation: form.buddyEvaluation !== null,
      jcReflection: form.jcReflection !== null,
      jcFeedback: form.jcFeedback !== null,
    };
  }, [form]);

  const canEditBuddySection = useMemo(() => {
    if (!form || !currentUserId) return false;
    if (form.status === 'submitted') return false;
    const isAdmin =
      authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';
    const isBuddy = form.buddyUserId === currentUserId;
    return isAdmin || isBuddy;
  }, [form, currentUserId, authState]);

  const canEditJCSection = useMemo(() => {
    if (!form || !currentUserId) return false;
    if (form.status === 'submitted') return false;
    const isAdmin =
      authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';
    const isJC = form.juniorCommanderUserId === currentUserId;
    return isAdmin || isJC;
  }, [form, currentUserId, authState]);

  const isAdmin = useMemo(() => {
    return authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';
  }, [authState]);

  return {
    form,
    isLoading: form === undefined,
    error: null,
    sectionCompletion,
    canEditBuddySection,
    canEditJCSection,
    isAdmin,
  };
}

/**
 * Hook to get review forms by year for the current user
 */
export function useReviewFormsByYear(year: number): ReviewFormsByYearReturn {
  const forms = useSessionQuery(api.reviewForms.getReviewFormsByYear, {
    year,
  }) as ReviewForm[] | undefined;

  return {
    forms,
    isLoading: forms === undefined,
    error: null,
  };
}

/**
 * Hook to get all review forms by year (admin only)
 */
export function useAllReviewFormsByYear(
  year: number,
  status?: 'draft' | 'in_progress' | 'submitted',
  ageGroup?: 'RK' | 'DR' | 'AR' | 'ER'
): AllReviewFormsReturn {
  const forms = useSessionQuery(api.reviewForms.getAllReviewFormsByYear, {
    year,
    status,
    ageGroup,
  }) as ReviewForm[] | undefined;

  return {
    forms,
    isLoading: forms === undefined,
    error: null,
    totalCount: forms?.length || 0,
  };
}

/**
 * Hook to create a new review form
 * Returns form ID and access tokens
 */
export function useCreateReviewForm() {
  const createMutation = useSessionMutation(api.reviewForms.createReviewForm);

  return async (params: CreateReviewFormParams): Promise<CreateReviewFormResponse> => {
    return await createMutation(params);
  };
}

/**
 * Hook to update particulars section
 */
export function useUpdateParticulars() {
  const updateMutation = useSessionMutation(api.reviewForms.updateParticulars);

  return async (params: UpdateParticularsParams): Promise<void> => {
    await updateMutation(params);
  };
}

/**
 * Hook to update buddy evaluation section
 */
export function useUpdateBuddyEvaluation() {
  const updateMutation = useSessionMutation(api.reviewForms.updateBuddyEvaluation);

  return async (params: UpdateBuddyEvaluationParams): Promise<void> => {
    await updateMutation(params);
  };
}

/**
 * Hook to update JC reflection section
 */
export function useUpdateJCReflection() {
  const updateMutation = useSessionMutation(api.reviewForms.updateJCReflection);

  return async (params: UpdateJCReflectionParams): Promise<void> => {
    await updateMutation(params);
  };
}

/**
 * Hook to update JC feedback section
 */
export function useUpdateJCFeedback() {
  const updateMutation = useSessionMutation(api.reviewForms.updateJCFeedback);

  return async (params: UpdateJCFeedbackParams): Promise<void> => {
    await updateMutation(params);
  };
}

/**
 * Hook to submit a review form
 */
export function useSubmitReviewForm() {
  const submitMutation = useSessionMutation(api.reviewForms.submitReviewForm);

  return async (formId: Id<'reviewForms'>): Promise<void> => {
    await submitMutation({ formId });
  };
}

/**
 * Hook to delete a review form
 */
export function useDeleteReviewForm() {
  const deleteMutation = useSessionMutation(api.reviewForms.deleteReviewForm);

  return async (formId: Id<'reviewForms'>): Promise<void> => {
    await deleteMutation({ formId });
  };
}

/**
 * Hook to regenerate access tokens (admin only)
 */
export function useRegenerateAccessTokens() {
  const regenerateMutation = useSessionMutation(api.reviewForms.regenerateAccessTokens);

  return async (formId: Id<'reviewForms'>): Promise<RegenerateTokensResponse> => {
    return await regenerateMutation({ formId });
  };
}

/**
 * Hook to toggle response visibility (admin only)
 */
export function useToggleResponseVisibility() {
  const toggleMutation = useSessionMutation(api.reviewForms.toggleResponseVisibility);

  return async (params: {
    formId: Id<'reviewForms'>;
    buddyResponsesVisibleToJC?: boolean;
    jcResponsesVisibleToBuddy?: boolean;
  }): Promise<void> => {
    await toggleMutation(params);
  };
}

/**
 * Hook to get all forms where the current user is a buddy (V2)
 */
export function useReviewFormsByBuddy(year?: number) {
  const forms = useSessionQuery(api.reviewForms.getReviewFormsByBuddy, year ? { year } : {}) as
    | ReviewForm[]
    | undefined;

  return {
    forms,
    isLoading: forms === undefined,
    totalCount: forms?.length || 0,
  };
}
