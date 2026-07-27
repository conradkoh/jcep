import { describe, expect, it } from 'vitest';
import {
  filterBuddyFormsForPersonalAccess,
  isMisassignedAdminBuddyForm,
} from './reviewFormPersonalAccess';

import type { Id } from '../_generated/dataModel';

const userId = 'user1' as Id<'users'>;
const otherId = 'user2' as Id<'users'>;
const participantId = 'participant1' as Id<'rotationParticipants'>;

describe('isMisassignedAdminBuddyForm', () => {
  it('returns true for admin-generated form with buddyUserId === createdBy', () => {
    expect(
      isMisassignedAdminBuddyForm(
        {
          buddyUserId: userId,
          createdBy: userId,
          rotationParticipantId: participantId,
          juniorCommanderUserId: null,
        },
        userId
      )
    ).toBe(true);
  });

  it('returns false when buddyUserId is null', () => {
    expect(
      isMisassignedAdminBuddyForm(
        {
          buddyUserId: null,
          createdBy: userId,
          rotationParticipantId: participantId,
          juniorCommanderUserId: null,
        },
        userId
      )
    ).toBe(false);
  });

  it('returns false for genuine buddy assignment (different createdBy)', () => {
    expect(
      isMisassignedAdminBuddyForm(
        {
          buddyUserId: userId,
          createdBy: otherId,
          rotationParticipantId: undefined,
          juniorCommanderUserId: null,
        },
        userId
      )
    ).toBe(false);
  });

  it('returns false when rotationParticipantId is undefined', () => {
    expect(
      isMisassignedAdminBuddyForm(
        {
          buddyUserId: userId,
          createdBy: userId,
          rotationParticipantId: undefined,
          juniorCommanderUserId: null,
        },
        userId
      )
    ).toBe(false);
  });

  it('returns false for a different user even when conditions match', () => {
    expect(
      isMisassignedAdminBuddyForm(
        {
          buddyUserId: otherId,
          createdBy: otherId,
          rotationParticipantId: participantId,
          juniorCommanderUserId: null,
        },
        userId
      )
    ).toBe(false);
  });
});

describe('filterBuddyFormsForPersonalAccess', () => {
  it('filters out misassigned forms while keeping others', () => {
    const forms = [
      {
        buddyUserId: userId,
        createdBy: userId,
        rotationParticipantId: participantId,
        juniorCommanderUserId: null,
      },
      {
        buddyUserId: userId,
        createdBy: otherId,
        rotationParticipantId: undefined,
        juniorCommanderUserId: null,
      },
      {
        buddyUserId: null,
        createdBy: userId,
        rotationParticipantId: participantId,
        juniorCommanderUserId: null,
      },
    ] as const;

    const filtered = filterBuddyFormsForPersonalAccess(forms as any[], userId);

    expect(filtered).toHaveLength(2);
    expect(filtered).not.toContain(forms[0]);
  });

  it('returns empty array when all forms are misassigned', () => {
    const forms = [
      {
        buddyUserId: userId,
        createdBy: userId,
        rotationParticipantId: participantId,
        juniorCommanderUserId: null,
      },
    ] as const;

    const filtered = filterBuddyFormsForPersonalAccess(forms as any[], userId);

    expect(filtered).toHaveLength(0);
  });

  it('returns all forms when none are misassigned', () => {
    const forms = [
      {
        buddyUserId: userId,
        createdBy: otherId,
        rotationParticipantId: undefined,
        juniorCommanderUserId: null,
      },
      {
        buddyUserId: otherId,
        createdBy: otherId,
        rotationParticipantId: participantId,
        juniorCommanderUserId: null,
      },
    ] as const;

    const filtered = filterBuddyFormsForPersonalAccess(forms as any[], userId);

    expect(filtered).toHaveLength(2);
  });
});
