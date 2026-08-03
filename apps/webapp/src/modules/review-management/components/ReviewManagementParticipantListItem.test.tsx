import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReviewManagementParticipantListItem } from './ReviewManagementParticipantListItem';

import type { ReviewForm } from '@/modules/review/types';
import type { RotationParticipant } from '@/modules/rotations/types';

vi.mock('@/modules/review/components/ReviewFormVisibilityToggle', () => ({
  ReviewFormVisibilityToggle: () => <div>Visibility Mock</div>,
}));

const mockParticipant: RotationParticipant = {
  _id: 'p1' as never,
  rotationId: 'r1' as never,
  applicationId: 'a1' as never,
  fullName: 'Alice Tan',
  ageGroup: 'ER',
  addedAt: 1000,
  addedBy: 'u1' as never,
};

describe('ReviewManagementParticipantListItem', () => {
  it('renders participant details and field labels when no form exists', () => {
    const onGenerate = vi.fn();

    render(
      <ReviewManagementParticipantListItem
        participant={mockParticipant}
        form={undefined}
        onGenerate={onGenerate}
      />
    );

    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Next Rotation Preference')).toBeInTheDocument();
    expect(screen.getByText('Buddy Sections')).toBeInTheDocument();
    expect(screen.getByText('JC Sections')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(5);
    expect(screen.getByText('No form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate review form/i })).toBeInTheDocument();
  });

  it('renders form details when form exists', () => {
    const mockForm = {
      _id: 'f1' as never,
      buddyAccessToken: 'btoken',
      jcAccessToken: 'jtoken',
      buddyName: 'Buddy Smith',
      buddyEvaluation: null,
      jcReflection: null,
      jcFeedback: null,
      buddyResponsesVisibleToJC: false,
      jcResponsesVisibleToBuddy: false,
      juniorCommanderName: 'Alice Tan',
      rotationParticipantId: 'p1' as never,
      nextRotationPreference: null,
    } as unknown as ReviewForm;

    const onGenerate = vi.fn();

    render(
      <ReviewManagementParticipantListItem
        participant={mockParticipant}
        form={mockForm}
        onGenerate={onGenerate}
      />
    );

    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getAllByText('Buddy')).toHaveLength(2);
    expect(screen.getByText('Buddy Smith')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Next Rotation Preference')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Buddy Sections')).toBeInTheDocument();
    expect(screen.getByText('JC Sections')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Form created')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buddy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jc/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
  });

  it('renders next rotation preference label when set', () => {
    const mockForm = {
      _id: 'f1' as never,
      buddyAccessToken: 'btoken',
      jcAccessToken: 'jtoken',
      buddyName: 'Buddy Smith',
      buddyEvaluation: null,
      jcReflection: null,
      jcFeedback: null,
      buddyResponsesVisibleToJC: false,
      jcResponsesVisibleToBuddy: false,
      juniorCommanderName: 'Alice Tan',
      rotationParticipantId: 'p1' as never,
      nextRotationPreference: 'DR',
    } as unknown as ReviewForm;

    render(
      <ReviewManagementParticipantListItem
        participant={mockParticipant}
        form={mockForm}
        onGenerate={vi.fn()}
      />
    );

    expect(screen.getByText('Next Rotation Preference')).toBeInTheDocument();
    expect(screen.getByText('Discovery Rangers')).toBeInTheDocument();
  });
});
