/**
 * Unified hook for review form access
 * Handles both session-based (authenticated) and token-based (anonymous) access
 * Provides a consistent interface regardless of access mode
 */

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useCallback, useMemo } from 'react';
import type { AgeGroup, QuestionResponse, ReviewForm, SectionCompletion } from '../types';
import {
  useReviewForm,
  useSubmitReviewForm,
  useUpdateBuddyEvaluation,
  useUpdateJCFeedback,
  useUpdateJCReflection,
  useUpdateParticulars,
} from './useReviewForm';
import { useReviewFormByToken } from './useReviewFormByToken';
import {
  useUpdateBuddyEvaluationByToken,
  useUpdateJCFeedbackByToken,
  useUpdateJCReflectionByToken,
  useUpdateParticularsByToken,
} from './useTokenMutations';

export interface ReviewFormAccessReturn {
  // Data
  form: ReviewForm | null | undefined;
  isLoading: boolean;
  sectionCompletion: SectionCompletion;

  // Permissions
  canEditParticulars: boolean;
  canEditBuddyEvaluation: boolean;
  canEditJCReflection: boolean;
  canEditJCFeedback: boolean;
  canSubmit: boolean;
  isAdmin: boolean;

  // Mutations (unified - work for both session and token access)
  updateParticulars: (args: {
    formId: Id<'reviewForms'>;
    rotationYear?: number;
    rotationQuarter?: number;
    buddyName?: string;
    juniorCommanderName?: string;
    ageGroup?: AgeGroup;
    evaluationDate?: number;
  }) => Promise<void>;

  updateBuddyEvaluation: (args: {
    formId: Id<'reviewForms'>;
    tasksParticipated: QuestionResponse;
    strengths: QuestionResponse;
    areasForImprovement: QuestionResponse;
    wordsOfEncouragement: QuestionResponse;
  }) => Promise<void>;

  updateJCReflection: (args: {
    formId: Id<'reviewForms'>;
    nextRotationPreference: 'RK' | 'DR' | 'AR' | 'ER';
    activitiesParticipated: QuestionResponse;
    learningsFromJCEP: QuestionResponse;
    whatToDoDifferently: QuestionResponse;
    goalsForNextRotation: QuestionResponse;
  }) => Promise<void>;

  updateJCFeedback: (args: {
    formId: Id<'reviewForms'>;
    gratitudeToBuddy: QuestionResponse;
    programFeedback: QuestionResponse;
  }) => Promise<void>;

  submitForm: ((formId: Id<'reviewForms'>) => Promise<void>) | null;
}

/**
 * Unified hook for accessing review forms
 * Automatically handles session-based or token-based access
 */
export function useReviewFormAccess(
  formId: Id<'reviewForms'> | null,
  accessToken?: string | null
): ReviewFormAccessReturn {
  const isTokenAccess = !!accessToken;

  // Fetch data using appropriate method
  const sessionData = useReviewForm(isTokenAccess ? null : formId);
  const tokenData = useReviewFormByToken(accessToken);

  const data = isTokenAccess ? tokenData : sessionData;

  // Session-based mutations
  const updateParticularsSession = useUpdateParticulars();
  const updateBuddyEvaluationSession = useUpdateBuddyEvaluation();
  const updateJCReflectionSession = useUpdateJCReflection();
  const updateJCFeedbackSession = useUpdateJCFeedback();
  const submitFormSession = useSubmitReviewForm();

  // Token-based mutations
  const updateParticularsToken = useUpdateParticularsByToken(accessToken);
  const updateBuddyEvaluationToken = useUpdateBuddyEvaluationByToken(accessToken);
  const updateJCReflectionToken = useUpdateJCReflectionByToken(accessToken);
  const updateJCFeedbackToken = useUpdateJCFeedbackByToken(accessToken);

  // Extract permissions (handle type differences)
  const canEditParticulars = useMemo(() => {
    // Token access can edit particulars if form exists and is not submitted
    if (isTokenAccess) {
      // For token access, check if form exists and is not submitted
      const form = tokenData.form;
      return form ? form.status !== 'submitted' : false;
    }
    return 'canEditParticulars' in data ? data.canEditParticulars : false;
  }, [isTokenAccess, tokenData, data]);

  const canEditBuddyEvaluation = useMemo(() => {
    if ('canEditBuddyEvaluation' in data) return data.canEditBuddyEvaluation;
    if ('canEditBuddySection' in data) return data.canEditBuddySection;
    return false;
  }, [data]);

  const canEditJCReflection = useMemo(() => {
    if ('canEditJCReflection' in data) return data.canEditJCReflection;
    if ('canEditJCSection' in data) return data.canEditJCSection;
    return false;
  }, [data]);

  const canEditJCFeedback = useMemo(() => {
    if ('canEditJCFeedback' in data) return data.canEditJCFeedback;
    if ('canEditJCSection' in data) return data.canEditJCSection;
    return false;
  }, [data]);

  const canSubmit = useMemo(() => {
    if (isTokenAccess) return false; // Token access cannot submit
    return true; // Session access can submit if authorized
  }, [isTokenAccess]);

  const isAdmin = useMemo(() => {
    return 'isAdmin' in data ? data.isAdmin : false;
  }, [data]);

  // Create unified mutation functions
  const updateParticulars = useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      rotationYear?: number;
      rotationQuarter?: number;
      buddyName?: string;
      juniorCommanderName?: string;
      ageGroup?: 'RK' | 'DR' | 'AR' | 'ER';
      evaluationDate?: number;
    }) => {
      if (isTokenAccess) {
        await updateParticularsToken(args);
        return;
      }
      await updateParticularsSession(args);
    },
    [isTokenAccess, updateParticularsToken, updateParticularsSession]
  );

  const updateBuddyEvaluation = useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      tasksParticipated: QuestionResponse;
      strengths: QuestionResponse;
      areasForImprovement: QuestionResponse;
      wordsOfEncouragement: QuestionResponse;
    }) => {
      if (isTokenAccess) {
        await updateBuddyEvaluationToken(args);
        return;
      }
      await updateBuddyEvaluationSession(args);
    },
    [isTokenAccess, updateBuddyEvaluationToken, updateBuddyEvaluationSession]
  );

  const updateJCReflection = useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      nextRotationPreference: 'RK' | 'DR' | 'AR' | 'ER';
      activitiesParticipated: QuestionResponse;
      learningsFromJCEP: QuestionResponse;
      whatToDoDifferently: QuestionResponse;
      goalsForNextRotation: QuestionResponse;
    }) => {
      if (isTokenAccess) {
        // Token access also includes nextRotationPreference
        await updateJCReflectionToken(args);
        return;
      }
      // Session access
      await updateJCReflectionSession(args);
    },
    [isTokenAccess, updateJCReflectionToken, updateJCReflectionSession]
  );

  const updateJCFeedback = useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      gratitudeToBuddy: QuestionResponse;
      programFeedback: QuestionResponse;
    }) => {
      if (isTokenAccess) {
        await updateJCFeedbackToken(args);
        return;
      }
      await updateJCFeedbackSession(args);
    },
    [isTokenAccess, updateJCFeedbackToken, updateJCFeedbackSession]
  );

  const submitForm = useMemo(() => {
    if (isTokenAccess) return null;
    return submitFormSession;
  }, [isTokenAccess, submitFormSession]);

  return {
    form: data.form,
    isLoading: data.isLoading,
    sectionCompletion: data.sectionCompletion,
    canEditParticulars,
    canEditBuddyEvaluation,
    canEditJCReflection,
    canEditJCFeedback,
    canSubmit,
    isAdmin,
    updateParticulars,
    updateBuddyEvaluation,
    updateJCReflection,
    updateJCFeedback,
    submitForm,
  };
}
