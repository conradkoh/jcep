'use client';

import type { ReviewForm } from '../types';
import {
  isBuddyEvaluationComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from '../utils/sectionCompletionHelpers';

import { Badge } from '@/components/ui/badge';

export function ReviewFormBuddyProgressBadge({ form }: { form: ReviewForm }) {
  const isComplete = isBuddyEvaluationComplete(form);

  if (!form.buddyEvaluation) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
      >
        Not Started
      </Badge>
    );
  }

  if (isComplete) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
      >
        Completed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
    >
      In Progress
    </Badge>
  );
}

export function ReviewFormJCProgressBadge({ form }: { form: ReviewForm }) {
  const reflectionComplete = isJCReflectionComplete(form);
  const feedbackComplete = isJCFeedbackComplete(form);
  const hasReflection = form.jcReflection !== null;
  const hasFeedback = form.jcFeedback !== null;

  if (!hasReflection && !hasFeedback) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400"
      >
        Not Started
      </Badge>
    );
  }

  if (reflectionComplete && feedbackComplete) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
      >
        Completed
      </Badge>
    );
  }

  const completed = [reflectionComplete, feedbackComplete].filter(Boolean).length;
  const total = 2;
  return (
    <Badge
      variant="outline"
      className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
    >
      {completed}/{total} Sections
    </Badge>
  );
}
