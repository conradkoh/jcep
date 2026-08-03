import type { Id } from '@workspace/backend/convex/_generated/dataModel';

import type { AgeGroup } from '@/modules/jcep/types';

export type { AgeGroup };

export const UNASSIGNED_AGE_GROUP = '__unassigned__';

export type Rotation = {
  _id: Id<'rotations'>;
  _creationTime: number;
  rotationYear: number;
  rotationQuarter: number;
  evaluationDate: number;
  label?: string;
  createdAt: number;
  createdBy: Id<'users'>;
  participantCount?: number;
};

export type RotationParticipant = {
  _id: Id<'rotationParticipants'>;
  rotationId: Id<'rotations'>;
  applicationId: Id<'jcepApplications'>;
  fullName: string;
  ageGroup: AgeGroup;
  addedAt: number;
  addedBy: Id<'users'>;
};

export type ApplicantSearchResult = {
  _id: Id<'jcepApplications'>;
  fullName: string;
  contactNumber: string;
  ageGroupChoice1: AgeGroup;
  submissionYear: number;
};

export type RosterApplicant = {
  applicationId: Id<'jcepApplications'>;
  fullName: string;
  contactNumber: string;
  ageGroupChoice1: AgeGroup;
  submissionYear: number;
  submittedAt: number;
  ageGroupOnRotation: AgeGroup | null;
  participantId: Id<'rotationParticipants'> | null;
};

export type RotationRoster = {
  rotation: Rotation;
  applicants: RosterApplicant[];
};

export type RotationYearParticipant = {
  participantId: Id<'rotationParticipants'>;
  fullName: string;
  ageGroup: AgeGroup;
  nextRotationPreference: AgeGroup | null;
  reviewFormId: Id<'reviewForms'> | null;
};

export type RotationYearColumn = {
  rotation: Rotation;
  participants: RotationYearParticipant[];
};

export type UnmatchedReviewForm = {
  formId: Id<'reviewForms'>;
  juniorCommanderName: string;
  rotationYear: number;
  rotationNumber: number;
  rotationId?: Id<'rotations'>;
  ageGroup: AgeGroup;
};

export type RotationYearOverview = {
  year: number;
  rotations: RotationYearColumn[];
  unmatchedForms: UnmatchedReviewForm[];
};
