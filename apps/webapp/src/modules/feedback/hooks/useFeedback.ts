import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';

export type FeedbackSubmission = {
  _id: Id<'feedbackSubmissions'>;
  _creationTime: number;
  respondentName?: string;
  message: string;
  submittedAt: number;
  userId?: Id<'users'>;
};

export function useSubmitFeedback() {
  const submitMutation = useSessionMutation(api.feedbackSubmissions.submitFeedback);

  return async (params: { respondentName?: string; message: string }) => {
    return await submitMutation(params);
  };
}

export function useListFeedbackSubmissions(enabled: boolean) {
  const submissions = useSessionQuery(
    api.feedbackSubmissions.listFeedbackSubmissions,
    enabled ? {} : 'skip'
  ) as FeedbackSubmission[] | undefined;

  return {
    submissions,
    isLoading: enabled && submissions === undefined,
  };
}
