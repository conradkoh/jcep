/**
 * Helper functions to check if form sections are completed.
 * A section is considered completed when all required fields have non-empty trimmed values.
 */

import type { ReviewForm } from '../types';

/**
 * Checks if the Buddy Evaluation section is completed.
 * All 4 fields must have non-empty trimmed answers.
 */
export function isBuddyEvaluationComplete(form: ReviewForm): boolean {
  if (!form.buddyEvaluation) {
    return false;
  }

  const { tasksParticipated, strengths, areasForImprovement, wordsOfEncouragement } =
    form.buddyEvaluation;

  return (
    tasksParticipated.answer.trim() !== '' &&
    strengths.answer.trim() !== '' &&
    areasForImprovement.answer.trim() !== '' &&
    wordsOfEncouragement.answer.trim() !== ''
  );
}

/**
 * Checks if the JC Reflection section is completed.
 * All 5 fields must be filled: nextRotationPreference + 4 text fields with non-empty trimmed answers.
 */
export function isJCReflectionComplete(form: ReviewForm): boolean {
  if (!form.jcReflection || !form.nextRotationPreference) {
    return false;
  }

  const { activitiesParticipated, learningsFromJCEP, whatToDoDifferently, goalsForNextRotation } =
    form.jcReflection;

  return (
    activitiesParticipated.answer.trim() !== '' &&
    learningsFromJCEP.answer.trim() !== '' &&
    whatToDoDifferently.answer.trim() !== '' &&
    goalsForNextRotation.answer.trim() !== ''
  );
}

/**
 * Checks if the JC Feedback section is completed.
 * Both fields must have non-empty trimmed answers.
 */
export function isJCFeedbackComplete(form: ReviewForm): boolean {
  if (!form.jcFeedback) {
    return false;
  }

  const { gratitudeToBuddy, programFeedback } = form.jcFeedback;

  return gratitudeToBuddy.answer.trim() !== '' && programFeedback.answer.trim() !== '';
}

/**
 * Checks if all form sections are completed.
 * Returns true only if Buddy Evaluation, JC Reflection, and JC Feedback are all complete.
 */
export function isFormFullyComplete(form: ReviewForm): boolean {
  return (
    isBuddyEvaluationComplete(form) && isJCReflectionComplete(form) && isJCFeedbackComplete(form)
  );
}

/**
 * Gets a summary of section completion status.
 * Useful for displaying progress indicators.
 */
export function getSectionCompletionSummary(form: ReviewForm): {
  buddyEvaluation: boolean;
  jcReflection: boolean;
  jcFeedback: boolean;
  allComplete: boolean;
  completedCount: number;
  totalSections: number;
} {
  const buddyEvaluation = isBuddyEvaluationComplete(form);
  const jcReflection = isJCReflectionComplete(form);
  const jcFeedback = isJCFeedbackComplete(form);

  const completedCount = [buddyEvaluation, jcReflection, jcFeedback].filter(Boolean).length;
  const totalSections = 3;

  return {
    buddyEvaluation,
    jcReflection,
    jcFeedback,
    allComplete: completedCount === totalSections,
    completedCount,
    totalSections,
  };
}
