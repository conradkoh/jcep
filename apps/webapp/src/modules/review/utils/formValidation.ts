/**
 * Form validation utilities for JCEP Review Forms
 */

import type {
  CreateReviewFormParams,
  UpdateBuddyEvaluationParams,
  UpdateJCFeedbackParams,
  UpdateJCReflectionParams,
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate particulars section data
 */
export function validateParticulars(data: Partial<CreateReviewFormParams>): ValidationResult {
  const errors: string[] = [];

  if (!data.rotationYear) {
    errors.push('Rotation year is required');
  } else if (data.rotationYear < 2020 || data.rotationYear > 2100) {
    errors.push('Rotation year must be between 2020 and 2100');
  }

  if (!data.buddyUserId) {
    errors.push('Buddy user is required');
  }

  if (!data.buddyName || data.buddyName.trim().length === 0) {
    errors.push('Buddy name is required');
  }

  if (!data.juniorCommanderName || data.juniorCommanderName.trim().length === 0) {
    errors.push('Junior Commander name is required');
  }

  if (!data.ageGroup) {
    errors.push('Age group is required');
  }

  if (!data.evaluationDate) {
    errors.push('Evaluation date is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate buddy evaluation section data
 */
export function validateBuddyEvaluation(
  data: Partial<UpdateBuddyEvaluationParams>
): ValidationResult {
  const errors: string[] = [];

  if (!data.formId) {
    errors.push('Form ID is required');
  }

  if (!data.tasksParticipated?.answer || data.tasksParticipated.answer.trim().length === 0) {
    errors.push('Tasks participated is required');
  }

  if (!data.strengths?.answer || data.strengths.answer.trim().length === 0) {
    errors.push('Strengths is required');
  }

  if (!data.areasForImprovement?.answer || data.areasForImprovement.answer.trim().length === 0) {
    errors.push('Areas for improvement is required');
  }

  if (!data.wordsOfEncouragement?.answer || data.wordsOfEncouragement.answer.trim().length === 0) {
    errors.push('Words of encouragement is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate JC reflection section data
 */
export function validateJCReflection(data: Partial<UpdateJCReflectionParams>): ValidationResult {
  const errors: string[] = [];

  if (!data.formId) {
    errors.push('Form ID is required');
  }

  if (!data.nextRotationPreference) {
    errors.push('Next rotation preference is required');
  }

  if (
    !data.activitiesParticipated?.answer ||
    data.activitiesParticipated.answer.trim().length === 0
  ) {
    errors.push('Activities participated is required');
  }

  if (!data.learningsFromJCEP?.answer || data.learningsFromJCEP.answer.trim().length === 0) {
    errors.push('Learnings from JCEP is required');
  }

  if (!data.whatToDoDifferently?.answer || data.whatToDoDifferently.answer.trim().length === 0) {
    errors.push('What to do differently is required');
  }

  if (!data.goalsForNextRotation?.answer || data.goalsForNextRotation.answer.trim().length === 0) {
    errors.push('Goals for next rotation is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate JC feedback section data
 */
export function validateJCFeedback(data: Partial<UpdateJCFeedbackParams>): ValidationResult {
  const errors: string[] = [];

  if (!data.formId) {
    errors.push('Form ID is required');
  }

  if (!data.gratitudeToBuddy?.answer || data.gratitudeToBuddy.answer.trim().length === 0) {
    errors.push('Gratitude to buddy is required');
  }

  if (!data.programFeedback?.answer || data.programFeedback.answer.trim().length === 0) {
    errors.push('Program feedback is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
