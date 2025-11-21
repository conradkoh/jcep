/**
 * Tests for section completion helper functions
 */

import { describe, expect, it } from 'vitest';
import type { ReviewForm } from '../types';
import {
  getSectionCompletionSummary,
  isBuddyEvaluationComplete,
  isFormFullyComplete,
  isJCFeedbackComplete,
  isJCReflectionComplete,
} from './sectionCompletionHelpers';

// biome-ignore lint/suspicious/noExplicitAny: Mock data requires type assertions for testing
const createMockForm = (overrides?: Partial<ReviewForm>): ReviewForm => ({
  _id: 'test-id' as any,
  _creationTime: Date.now(),
  schemaVersion: 1,
  buddyAccessToken: 'token1',
  jcAccessToken: 'token2',
  tokenExpiresAt: null,
  buddyResponsesVisibleToJC: false,
  jcResponsesVisibleToBuddy: false,
  visibilityChangedAt: null,
  visibilityChangedBy: null,
  rotationYear: 2025,
  rotationQuarter: 1,
  buddyUserId: 'buddy-id' as any,
  buddyName: 'Test Buddy',
  juniorCommanderUserId: 'jc-id' as any,
  juniorCommanderName: 'Test JC',
  ageGroup: 'RK',
  evaluationDate: Date.now(),
  nextRotationPreference: null,
  buddyEvaluation: null,
  jcReflection: null,
  jcFeedback: null,
  status: 'draft',
  submittedAt: null,
  submittedBy: null,
  createdBy: 'admin-id' as any,
  ...overrides,
});

describe('sectionCompletionHelpers', () => {
  describe('isBuddyEvaluationComplete', () => {
    it('should return false when buddyEvaluation is null', () => {
      const form = createMockForm({ buddyEvaluation: null });
      expect(isBuddyEvaluationComplete(form)).toBe(false);
    });

    it('should return false when any field has empty answer', () => {
      const form = createMockForm({
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Some tasks' },
          strengths: { questionText: 'Q2', answer: '' }, // Empty
          areasForImprovement: { questionText: 'Q3', answer: 'Some areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Keep going' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
      });
      expect(isBuddyEvaluationComplete(form)).toBe(false);
    });

    it('should return false when any field has only whitespace', () => {
      const form = createMockForm({
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Some tasks' },
          strengths: { questionText: 'Q2', answer: '   ' }, // Only whitespace
          areasForImprovement: { questionText: 'Q3', answer: 'Some areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Keep going' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
      });
      expect(isBuddyEvaluationComplete(form)).toBe(false);
    });

    it('should return true when all fields have non-empty trimmed answers', () => {
      const form = createMockForm({
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Some tasks' },
          strengths: { questionText: 'Q2', answer: 'Great strength' },
          areasForImprovement: { questionText: 'Q3', answer: 'Some areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Keep going' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
      });
      expect(isBuddyEvaluationComplete(form)).toBe(true);
    });
  });

  describe('isJCReflectionComplete', () => {
    it('should return false when jcReflection is null', () => {
      const form = createMockForm({ jcReflection: null });
      expect(isJCReflectionComplete(form)).toBe(false);
    });

    it('should return false when nextRotationPreference is null', () => {
      const form = createMockForm({
        nextRotationPreference: null,
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activities' },
          learningsFromJCEP: { questionText: 'Q2', answer: 'Learnings' },
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isJCReflectionComplete(form)).toBe(false);
    });

    it('should return false when any field has empty answer', () => {
      const form = createMockForm({
        nextRotationPreference: 'DR',
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activities' },
          learningsFromJCEP: { questionText: 'Q2', answer: '' }, // Empty
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isJCReflectionComplete(form)).toBe(false);
    });

    it('should return true when nextRotationPreference is set and all fields have non-empty answers', () => {
      const form = createMockForm({
        nextRotationPreference: 'DR',
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activities' },
          learningsFromJCEP: { questionText: 'Q2', answer: 'Learnings' },
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isJCReflectionComplete(form)).toBe(true);
    });
  });

  describe('isJCFeedbackComplete', () => {
    it('should return false when jcFeedback is null', () => {
      const form = createMockForm({ jcFeedback: null });
      expect(isJCFeedbackComplete(form)).toBe(false);
    });

    it('should return false when any field has empty answer', () => {
      const form = createMockForm({
        jcFeedback: {
          gratitudeToBuddy: { questionText: 'Q1', answer: 'Thank you' },
          programFeedback: { questionText: 'Q2', answer: '' }, // Empty
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isJCFeedbackComplete(form)).toBe(false);
    });

    it('should return true when all fields have non-empty answers', () => {
      const form = createMockForm({
        jcFeedback: {
          gratitudeToBuddy: { questionText: 'Q1', answer: 'Thank you' },
          programFeedback: { questionText: 'Q2', answer: 'Great program' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isJCFeedbackComplete(form)).toBe(true);
    });
  });

  describe('isFormFullyComplete', () => {
    it('should return false when no sections are complete', () => {
      const form = createMockForm({
        buddyEvaluation: null,
        jcReflection: null,
        jcFeedback: null,
      });
      expect(isFormFullyComplete(form)).toBe(false);
    });

    it('should return false when only some sections are complete', () => {
      const form = createMockForm({
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Tasks' },
          strengths: { questionText: 'Q2', answer: 'Strengths' },
          areasForImprovement: { questionText: 'Q3', answer: 'Areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Words' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
        jcReflection: null,
        jcFeedback: null,
      });
      expect(isFormFullyComplete(form)).toBe(false);
    });

    it('should return true when all sections are complete', () => {
      const form = createMockForm({
        nextRotationPreference: 'DR',
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Tasks' },
          strengths: { questionText: 'Q2', answer: 'Strengths' },
          areasForImprovement: { questionText: 'Q3', answer: 'Areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Words' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activities' },
          learningsFromJCEP: { questionText: 'Q2', answer: 'Learnings' },
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
        jcFeedback: {
          gratitudeToBuddy: { questionText: 'Q1', answer: 'Thank you' },
          programFeedback: { questionText: 'Q2', answer: 'Great program' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      expect(isFormFullyComplete(form)).toBe(true);
    });
  });

  describe('getSectionCompletionSummary', () => {
    it('should return summary with no sections complete', () => {
      const form = createMockForm();
      const summary = getSectionCompletionSummary(form);

      expect(summary).toEqual({
        buddyEvaluation: false,
        jcReflection: false,
        jcFeedback: false,
        allComplete: false,
        completedCount: 0,
        totalSections: 3,
      });
    });

    it('should return summary with one section complete', () => {
      const form = createMockForm({
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Tasks' },
          strengths: { questionText: 'Q2', answer: 'Strengths' },
          areasForImprovement: { questionText: 'Q3', answer: 'Areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Words' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
      });
      const summary = getSectionCompletionSummary(form);

      expect(summary).toEqual({
        buddyEvaluation: true,
        jcReflection: false,
        jcFeedback: false,
        allComplete: false,
        completedCount: 1,
        totalSections: 3,
      });
    });

    it('should return summary with all sections complete', () => {
      const form = createMockForm({
        nextRotationPreference: 'DR',
        buddyEvaluation: {
          tasksParticipated: { questionText: 'Q1', answer: 'Tasks' },
          strengths: { questionText: 'Q2', answer: 'Strengths' },
          areasForImprovement: { questionText: 'Q3', answer: 'Areas' },
          wordsOfEncouragement: { questionText: 'Q4', answer: 'Words' },
          completedAt: Date.now(),
          completedBy: 'buddy-id' as any,
        },
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activities' },
          learningsFromJCEP: { questionText: 'Q2', answer: 'Learnings' },
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
        jcFeedback: {
          gratitudeToBuddy: { questionText: 'Q1', answer: 'Thank you' },
          programFeedback: { questionText: 'Q2', answer: 'Great program' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });
      const summary = getSectionCompletionSummary(form);

      expect(summary).toEqual({
        buddyEvaluation: true,
        jcReflection: true,
        jcFeedback: true,
        allComplete: true,
        completedCount: 3,
        totalSections: 3,
      });
    });
  });
});
