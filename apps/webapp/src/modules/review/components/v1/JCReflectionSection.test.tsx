import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JCReflectionSection } from './JCReflectionSection';
import type { ReviewForm } from '../../types';

// biome-ignore lint/suspicious/noExplicitAny: Mock data requires type assertions for testing
const createMockForm = (overrides?: Partial<ReviewForm>): ReviewForm => ({
  _id: 'test-form-id' as any,
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

describe('JCReflectionSection', () => {
  describe('Autosave functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should save text field changes with current nextRotationPreference', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      const form = createMockForm({
        nextRotationPreference: 'DR',
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: '' },
          learningsFromJCEP: { questionText: 'Q2', answer: '' },
          whatToDoDifferently: { questionText: 'Q3', answer: '' },
          goalsForNextRotation: { questionText: 'Q4', answer: '' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });

      render(<JCReflectionSection form={form} canEdit={true} onUpdate={mockUpdate} />);

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      // Type in first textarea
      const textarea = screen.getByPlaceholderText(/Explain why these activities/i);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'New activity text');

      // Wait for autosave
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              nextRotationPreference: 'DR', // Should include current value
              activitiesParticipated: expect.objectContaining({
                answer: 'New activity text',
              }),
            })
          );
        },
        { timeout: 2500 }
      );
    });

  });

  describe('Read-only mode', () => {
    it('should display nextRotationPreference value when set', () => {
      const form = createMockForm({
        nextRotationPreference: 'DR',
        jcReflection: {
          activitiesParticipated: { questionText: 'Q1', answer: 'Activity' },
          learningsFromJCEP: { questionText: 'Q2', answer: 'Learning' },
          whatToDoDifferently: { questionText: 'Q3', answer: 'Different' },
          goalsForNextRotation: { questionText: 'Q4', answer: 'Goals' },
          completedAt: Date.now(),
          completedBy: 'jc-id' as any,
        },
      });

      render(<JCReflectionSection form={form} canEdit={false} onUpdate={vi.fn()} />);

      expect(screen.getByText('DR')).toBeInTheDocument();
    });

    it('should not show nextRotationPreference when null', () => {
      const form = createMockForm({
        nextRotationPreference: null,
        jcReflection: null,
      });

      render(<JCReflectionSection form={form} canEdit={false} onUpdate={vi.fn()} />);

      expect(screen.queryByText(/DR|RK|AR|ER/)).not.toBeInTheDocument();
    });
  });
});

