/**
 * Hooks for token-based mutations (anonymous access)
 */

import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';
import type { QuestionResponse } from '../types';

/**
 * Hook to update buddy evaluation via token
 */
export function useUpdateBuddyEvaluationByToken(accessToken: string | null | undefined) {
  const mutation = useMutation(api.reviewForms.updateBuddyEvaluationByToken);

  return useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      tasksParticipated: QuestionResponse;
      strengths: QuestionResponse;
      areasForImprovement: QuestionResponse;
      wordsOfEncouragement: QuestionResponse;
    }) => {
      if (!accessToken) {
        throw new Error('No access token provided');
      }
      return await mutation({
        accessToken,
        ...args,
      });
    },
    [mutation, accessToken]
  );
}

/**
 * Hook to update JC reflection via token
 */
export function useUpdateJCReflectionByToken(accessToken: string | null | undefined) {
  const mutation = useMutation(api.reviewForms.updateJCReflectionByToken);

  return useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      nextRotationPreference: 'RK' | 'DR' | 'AR' | 'ER';
      activitiesParticipated: QuestionResponse;
      learningsFromJCEP: QuestionResponse;
      whatToDoDifferently: QuestionResponse;
      goalsForNextRotation: QuestionResponse;
    }) => {
      if (!accessToken) {
        throw new Error('No access token provided');
      }
      return await mutation({
        accessToken,
        ...args,
      });
    },
    [mutation, accessToken]
  );
}

/**
 * Hook to update JC feedback via token
 */
export function useUpdateJCFeedbackByToken(accessToken: string | null | undefined) {
  const mutation = useMutation(api.reviewForms.updateJCFeedbackByToken);

  return useCallback(
    async (args: {
      formId: Id<'reviewForms'>;
      gratitudeToBuddy: QuestionResponse;
      programFeedback: QuestionResponse;
    }) => {
      if (!accessToken) {
        throw new Error('No access token provided');
      }
      return await mutation({
        accessToken,
        ...args,
      });
    },
    [mutation, accessToken]
  );
}
