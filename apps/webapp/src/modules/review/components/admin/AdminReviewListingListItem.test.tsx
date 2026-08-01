import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminReviewListingListItem } from './AdminReviewListingListItem';

import type { ReviewForm } from '@/modules/review/types';

vi.mock('@/modules/review/components/ReviewFormVisibilityToggle', () => ({
  ReviewFormVisibilityToggle: () => <div>Visibility Mock</div>,
}));

const mockForm = {
  _id: 'f1' as never,
  rotationYear: 2026,
  rotationNumber: 1,
  buddyName: 'Buddy Smith',
  juniorCommanderName: 'JC Doe',
  ageGroup: 'ER' as const,
  nextRotationPreference: null,
  status: 'not_started' as const,
  buddyEvaluation: null,
  jcReflection: null,
  jcFeedback: null,
  buddyAccessToken: 'btoken',
  jcAccessToken: 'jtoken',
  buddyResponsesVisibleToJC: false,
  jcResponsesVisibleToBuddy: false,
  rotationParticipantId: 'p1' as never,
} as unknown as ReviewForm;

describe('AdminReviewListingListItem', () => {
  it('renders all field labels and rotation label', () => {
    const onCopyBuddy = vi.fn();
    const onCopyJC = vi.fn();
    const onArchive = vi.fn();
    const onUnarchive = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminReviewListingListItem
        form={mockForm}
        copiedToken={null}
        showArchiveAction={false}
        showUnarchiveAction={false}
        archivingFormId={null}
        onCopyBuddy={onCopyBuddy}
        onCopyJC={onCopyJC}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('2026 Rotation 1')).toBeInTheDocument();
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('JC')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Next Rotation Preference')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();

    expect(screen.getByText('Buddy Smith')).toBeInTheDocument();
    expect(screen.getByText('JC Doe')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getAllByText('Not Started')).toHaveLength(3);

    expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument();
  });
});
