import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RotationYearOverviewTab } from './RotationYearOverviewTab';
import type { RotationYearOverview } from '../types';

const mockState = vi.hoisted(() => ({
  overview: null as RotationYearOverview | null,
}));

vi.mock('../hooks/useRotations', () => ({
  useRotationYearOverview: () => ({
    data: mockState.overview,
    isLoading: mockState.overview === null,
  }),
}));

vi.mock('@/modules/review/components/ReviewYearSelect', () => ({
  ReviewYearSelect: () => <div>Year Select Mock</div>,
}));

const makeOverview = (): RotationYearOverview => ({
  year: 2026,
  rotations: [
    {
      rotation: {
        _id: 'r1' as never,
        _creationTime: 1000,
        rotationYear: 2026,
        rotationQuarter: 1,
        evaluationDate: 1000,
        createdAt: 1000,
        createdBy: 'u1' as never,
      },
      participants: [
        {
          participantId: 'p1' as never,
          fullName: 'Alice Tan',
          ageGroup: 'ER',
          nextRotationPreference: null,
          reviewFormId: null,
        },
        {
          participantId: 'p2' as never,
          fullName: 'Bob Lee',
          ageGroup: 'DR',
          nextRotationPreference: 'AR',
          reviewFormId: 'f1' as never,
        },
      ],
    },
  ],
  unmatchedForms: [],
});

describe('RotationYearOverviewTab', () => {
  it('renders participants with muted missing form state', () => {
    mockState.overview = makeOverview();
    render(<RotationYearOverviewTab isAdmin rotations={[]} />);

    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    const noForm = screen.getByText('No form');
    expect(noForm).toHaveClass('text-muted-foreground');

    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
    expect(screen.getByText('Adventure Rangers')).toHaveClass('text-foreground');
  });

  it('renders empty state when no rotations for the year', () => {
    mockState.overview = { ...makeOverview(), rotations: [] };
    render(<RotationYearOverviewTab isAdmin rotations={[]} />);

    expect(screen.getByText('No rotations created for 2026.')).toBeInTheDocument();
  });
});
