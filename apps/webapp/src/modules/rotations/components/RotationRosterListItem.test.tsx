import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RosterApplicant } from '../types';
import { RotationRosterListItem } from './RotationRosterListItem';

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({
    children,
    className,
    value,
  }: {
    children: React.ReactNode;
    className?: string;
    value: string;
  }) => (
    <div data-slot="select-item" data-value={value} className={className}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: () => null,
}));

const mockApplicant: RosterApplicant = {
  applicationId: 'a1' as never,
  fullName: 'Alice Tan',
  contactNumber: '91234567',
  ageGroupChoice1: 'ER',
  submissionYear: 2025,
  submittedAt: 1000,
  ageGroupOnRotation: null,
  participantId: null,
};

describe('RotationRosterListItem', () => {
  it('renders applicant details, field labels, and assignment options', () => {
    render(
      <RotationRosterListItem
        applicant={mockApplicant}
        selectValue="__unassigned__"
        isUpdating={false}
        onAgeGroupChange={vi.fn()}
      />
    );

    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('App Preference')).toBeInTheDocument();
    expect(screen.getByText('Assignment')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getAllByText('Expedition Rangers').length).toBeGreaterThan(0);
  });

  it('uses a full-width select trigger', () => {
    render(
      <RotationRosterListItem
        applicant={mockApplicant}
        selectValue="__unassigned__"
        isUpdating={false}
        onAgeGroupChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('select-trigger')).toHaveClass('w-full');
  });

  it('highlights the list item with bg-primary/5 when assigned', () => {
    const assignedApplicant: RosterApplicant = { ...mockApplicant, ageGroupOnRotation: 'RK' };

    render(
      <RotationRosterListItem
        applicant={assignedApplicant}
        selectValue="RK"
        isUpdating={false}
        onAgeGroupChange={vi.fn()}
      />
    );

    const listItem = screen.getByText('Alice Tan').closest('[data-slot="data-list-item"]');
    expect(listItem).toHaveClass('bg-primary/5');
  });
});
