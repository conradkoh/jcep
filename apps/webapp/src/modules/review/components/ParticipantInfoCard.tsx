/**
 * Participant Info Card
 * Shows participant names and other participant's progress on token access page
 */

'use client';

'use client';

import type { ReviewForm, TokenAccessLevel } from '../types';
import {
  isBuddyEvaluationComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from '../utils/sectionCompletionHelpers';

export interface ParticipantInfoCardProps {
  form: ReviewForm;
  accessLevel: TokenAccessLevel;
}

const getBuddyProgress = (form: ReviewForm) => {
  if (!form.buddyEvaluation) {
    return 'Not started';
  }
  const isComplete = isBuddyEvaluationComplete(form);
  if (isComplete) {
    return 'Completed';
  }
  return 'In progress';
};

const getJCProgress = (form: ReviewForm) => {
  const hasReflection = form.jcReflection !== null;
  const hasFeedback = form.jcFeedback !== null;

  if (!hasReflection && !hasFeedback) {
    return 'Not started';
  }

  const reflectionComplete = isJCReflectionComplete(form);
  const feedbackComplete = isJCFeedbackComplete(form);

  if (reflectionComplete && feedbackComplete) {
    return 'Completed';
  }

  const completed = [reflectionComplete, feedbackComplete].filter(Boolean).length;
  const total = 2;
  return `${completed}/${total} sections`;
};

export function ParticipantInfoCard({ form, accessLevel }: ParticipantInfoCardProps) {
  const isBuddy = accessLevel === 'buddy';
  const welcomeName = isBuddy ? form.buddyName : form.juniorCommanderName;
  const counterpartName = isBuddy ? form.juniorCommanderName : form.buddyName;
  const counterpartLabel = isBuddy ? 'Junior Commander' : 'Buddy';
  const counterpartStatus = isBuddy ? getJCProgress(form) : getBuddyProgress(form);

  return (
    <div className="mb-6">
      <p className="text-lg font-semibold text-foreground">Welcome, {welcomeName}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {isBuddy ? 'Buddy access link' : 'Junior Commander access link'}
      </p>
      <p className="text-xs text-muted-foreground">
        {counterpartLabel}: {counterpartName} · Status: {counterpartStatus}
      </p>
    </div>
  );
}
