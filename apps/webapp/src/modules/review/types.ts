/**
 * Frontend types for JCEP Review Forms
 */

import type { Id } from '@workspace/backend/convex/_generated/dataModel';

// Age group options
export type AgeGroup = 'RK' | 'DR' | 'AR' | 'ER';

// Form completion status
export type ReviewFormStatus = 'not_started' | 'in_progress' | 'complete' | 'submitted';

// Schema version for form structure
export type ReviewFormSchemaVersion = 1; // Increment for breaking changes

// Section completion tracking
export interface SectionCompletion {
  particulars: boolean;
  buddyEvaluation: boolean;
  jcReflection: boolean;
  jcFeedback: boolean;
}

// Question with captured text for versioning
export interface QuestionResponse {
  questionText: string; // The question as it was when answered
  answer: string;
}

// Access level for token-based access
export type TokenAccessLevel = 'buddy' | 'jc';

// Review form entity (Version 1)
export interface ReviewForm {
  _id: Id<'reviewForms'>;
  _creationTime: number;

  // Schema version for data migration and UI routing
  schemaVersion: ReviewFormSchemaVersion;

  // V2: Secret access tokens for anonymous access
  buddyAccessToken: string;
  jcAccessToken: string;
  tokenExpiresAt: number | null;

  // V2: Response visibility control
  buddyResponsesVisibleToJC: boolean;
  jcResponsesVisibleToBuddy: boolean;
  visibilityChangedAt: number | null;
  visibilityChangedBy: Id<'users'> | null;

  // Particulars
  rotationYear: number;
  rotationQuarter: number; // 1-4 for up to 4 rotations per year
  buddyUserId: Id<'users'>;
  buddyName: string;
  juniorCommanderUserId: Id<'users'> | null; // Null if JC is not a registered user
  juniorCommanderName: string;
  ageGroup: AgeGroup;
  evaluationDate: number; // timestamp

  // Next rotation preference (filled by JC)
  nextRotationPreference: AgeGroup | null;

  // Buddy Evaluation Section (with question text captured)
  buddyEvaluation: {
    tasksParticipated: QuestionResponse;
    strengths: QuestionResponse;
    areasForImprovement: QuestionResponse;
    wordsOfEncouragement: QuestionResponse;
    completedAt: number | null;
    completedBy: Id<'users'> | null;
  } | null;

  // Junior Commander Reflection Section (with question text captured)
  jcReflection: {
    activitiesParticipated: QuestionResponse;
    learningsFromJCEP: QuestionResponse;
    whatToDoDifferently: QuestionResponse;
    goalsForNextRotation: QuestionResponse;
    completedAt: number | null;
    completedBy: Id<'users'> | null;
  } | null;

  // Junior Commander Feedback Section (with question text captured)
  jcFeedback: {
    gratitudeToBuddy: QuestionResponse;
    programFeedback: QuestionResponse;
    completedAt: number | null;
    completedBy: Id<'users'> | null;
  } | null;

  // Meta
  status: ReviewFormStatus;
  submittedAt: number | null;
  submittedBy: Id<'users'> | null;
  createdBy: Id<'users'>;
}

// Hook return types
export interface ReviewFormHookReturn {
  form: ReviewForm | undefined | null;
  isLoading: boolean;
  error: string | null;
  sectionCompletion: SectionCompletion;
  canEditBuddySection: boolean;
  canEditJCSection: boolean;
  isAdmin: boolean;
}

export interface ReviewFormsByYearReturn {
  forms: ReviewForm[] | undefined;
  isLoading: boolean;
  error: string | null;
}

export interface AllReviewFormsReturn {
  forms: ReviewForm[] | undefined;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

// Mutation parameter types
export interface CreateReviewFormParams {
  rotationYear: number;
  rotationQuarter: number; // 1-4
  buddyUserId: Id<'users'>;
  buddyName: string;
  juniorCommanderUserId: Id<'users'> | null;
  juniorCommanderName: string;
  ageGroup: AgeGroup;
  evaluationDate: number;
}

export interface UpdateParticularsParams {
  formId: Id<'reviewForms'>;
  rotationYear?: number;
  rotationQuarter?: number;
  buddyName?: string;
  juniorCommanderName?: string;
  ageGroup?: AgeGroup;
  evaluationDate?: number;
}

export interface UpdateBuddyEvaluationParams {
  formId: Id<'reviewForms'>;
  tasksParticipated: QuestionResponse;
  strengths: QuestionResponse;
  areasForImprovement: QuestionResponse;
  wordsOfEncouragement: QuestionResponse;
}

export interface UpdateJCReflectionParams {
  formId: Id<'reviewForms'>;
  nextRotationPreference: AgeGroup;
  activitiesParticipated: QuestionResponse;
  learningsFromJCEP: QuestionResponse;
  whatToDoDifferently: QuestionResponse;
  goalsForNextRotation: QuestionResponse;
}

export interface UpdateJCFeedbackParams {
  formId: Id<'reviewForms'>;
  gratitudeToBuddy: QuestionResponse;
  programFeedback: QuestionResponse;
}

// V2: Token-based access types
export interface TokenAccessResponse {
  form: ReviewForm;
  accessLevel: TokenAccessLevel;
}

export interface CreateReviewFormResponse {
  formId: Id<'reviewForms'>;
  buddyAccessToken: string;
  jcAccessToken: string;
}

export interface RegenerateTokensResponse {
  buddyAccessToken: string;
  jcAccessToken: string;
}
