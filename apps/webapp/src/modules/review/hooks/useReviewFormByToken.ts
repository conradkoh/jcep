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

    // Use helper functions to validate complete sections with meaningful content
    const buddyComplete = isBuddyEvaluationComplete(form);
    const jcReflectionComplete = isJCReflectionComplete(form);
    const jcFeedbackComplete = isJCFeedbackComplete(form);

    // DEBUG: Log section completion status
    console.log('[useReviewFormByToken] Section Completion Debug:', {
      formId: form._id,
      buddyEvaluation: {
        exists: form.buddyEvaluation !== null,
        complete: buddyComplete,
        data: form.buddyEvaluation
          ? {
              tasksParticipated: {
                length: form.buddyEvaluation.tasksParticipated.answer.length,
                trimmedLength: form.buddyEvaluation.tasksParticipated.answer.trim().length,
              },
              strengths: {
                length: form.buddyEvaluation.strengths.answer.length,
                trimmedLength: form.buddyEvaluation.strengths.answer.trim().length,
              },
              areasForImprovement: {
                length: form.buddyEvaluation.areasForImprovement.answer.length,
                trimmedLength: form.buddyEvaluation.areasForImprovement.answer.trim().length,
              },
              wordsOfEncouragement: {
                length: form.buddyEvaluation.wordsOfEncouragement.answer.length,
                trimmedLength: form.buddyEvaluation.wordsOfEncouragement.answer.trim().length,
              },
            }
          : null,
      },
      jcReflection: {
        exists: form.jcReflection !== null,
        complete: jcReflectionComplete,
        nextRotationPreference: form.nextRotationPreference,
        WHY_INCOMPLETE: !jcReflectionComplete
          ? !form.jcReflection
            ? '❌ Section not created yet'
            : !form.nextRotationPreference
              ? '❌ Next Rotation Preference NOT SELECTED - this is required!'
              : form.jcReflection.activitiesParticipated.answer.trim() === ''
                ? '❌ Activities Participated field is empty'
                : form.jcReflection.learningsFromJCEP.answer.trim() === ''
                  ? '❌ Learnings from JCEP field is empty'
                  : form.jcReflection.whatToDoDifferently.answer.trim() === ''
                    ? '❌ What to do differently field is empty'
                    : form.jcReflection.goalsForNextRotation.answer.trim() === ''
                      ? '❌ Goals for next rotation field is empty'
                      : '❓ Unknown reason'
          : '✅ All fields complete!',
        data: form.jcReflection
          ? {
              activitiesParticipated: {
                length: form.jcReflection.activitiesParticipated.answer.length,
                trimmedLength: form.jcReflection.activitiesParticipated.answer.trim().length,
                isEmpty: form.jcReflection.activitiesParticipated.answer.trim() === '',
                preview: form.jcReflection.activitiesParticipated.answer.substring(0, 50),
              },
              learningsFromJCEP: {
                length: form.jcReflection.learningsFromJCEP.answer.length,
                trimmedLength: form.jcReflection.learningsFromJCEP.answer.trim().length,
                isEmpty: form.jcReflection.learningsFromJCEP.answer.trim() === '',
                preview: form.jcReflection.learningsFromJCEP.answer.substring(0, 50),
              },
              whatToDoDifferently: {
                length: form.jcReflection.whatToDoDifferently.answer.length,
                trimmedLength: form.jcReflection.whatToDoDifferently.answer.trim().length,
                isEmpty: form.jcReflection.whatToDoDifferently.answer.trim() === '',
                preview: form.jcReflection.whatToDoDifferently.answer.substring(0, 50),
              },
              goalsForNextRotation: {
                length: form.jcReflection.goalsForNextRotation.answer.length,
                trimmedLength: form.jcReflection.goalsForNextRotation.answer.trim().length,
                isEmpty: form.jcReflection.goalsForNextRotation.answer.trim() === '',
                preview: form.jcReflection.goalsForNextRotation.answer.substring(0, 50),
              },
            }
          : null,
      },
      jcFeedback: {
        exists: form.jcFeedback !== null,
        complete: jcFeedbackComplete,
        data: form.jcFeedback
          ? {
              gratitudeToBuddy: {
                length: form.jcFeedback.gratitudeToBuddy.answer.length,
                trimmedLength: form.jcFeedback.gratitudeToBuddy.answer.trim().length,
              },
              programFeedback: {
                length: form.jcFeedback.programFeedback.answer.length,
                trimmedLength: form.jcFeedback.programFeedback.answer.trim().length,
              },
            }
          : null,
      },
    });

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
