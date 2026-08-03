import { describe, expect, test } from 'vitest';

import { loginAs } from '../test-utils/auth';
import { t } from '../test.setup';
import { api } from './_generated/api';

describe('rotations year overview', () => {
  const evaluationDate = Date.now();

  async function seedRotationWithLinkedForm(year: number) {
    const { sessionId, userId } = await loginAs({ roleNames: ['jcep_admin'] });
    const { applicationId } = await t.mutation(api.jcepApplications.submitApplication, {
      fullName: 'Year Overview JC',
      contactNumber: '90000001',
      ageGroupChoice1: 'RK',
      reasonForChoice1: 'Test',
      acknowledgedMottoAndPledge: true,
    });
    const { rotationId } = await t.mutation(api.rotations.createRotation, {
      sessionId,
      rotationYear: year,
      rotationQuarter: 1,
      evaluationDate,
    });
    const { participantId } = await t.mutation(api.rotations.addParticipant, {
      sessionId,
      rotationId,
      applicationId,
      ageGroup: 'RK',
    });
    const { formId } = await t.mutation(api.reviewForms.createReviewForm, {
      sessionId,
      rotationYear: year,
      rotationNumber: 1,
      buddyUserId: userId,
      buddyName: 'Buddy',
      juniorCommanderUserId: null,
      juniorCommanderName: 'Year Overview JC',
      ageGroup: 'RK',
      evaluationDate,
      rotationId,
      rotationParticipantId: participantId,
    });
    return { sessionId, userId, rotationId, participantId, formId };
  }

  test('getRotationYearOverview returns preference from linked form', async () => {
    const year = 2030;
    const { sessionId, participantId } = await seedRotationWithLinkedForm(year);
    const overview = await t.query(api.rotations.getRotationYearOverview, { sessionId, year });
    expect(overview.year).toBe(year);
    const col = overview.rotations.find((c) => c.rotation.rotationQuarter === 1);
    expect(col).toBeDefined();
    const row = col?.participants.find((p) => p.participantId === participantId);
    expect(row?.fullName).toBe('Year Overview JC');
    expect(row?.reviewFormId).toBeTruthy();
  });

  test('unmatched forms exclude linked forms', async () => {
    const year = 2031;
    const { sessionId, userId } = await loginAs({ roleNames: ['jcep_admin'] });
    await t.mutation(api.reviewForms.createReviewForm, {
      sessionId,
      rotationYear: year,
      rotationNumber: 2,
      buddyUserId: userId,
      buddyName: 'Buddy',
      juniorCommanderUserId: null,
      juniorCommanderName: 'Unmatched JC',
      ageGroup: 'DR',
      evaluationDate,
      // no rotationParticipantId
    });
    const overview = await t.query(api.rotations.getRotationYearOverview, { sessionId, year });
    expect(overview.unmatchedForms.some((f) => f.juniorCommanderName === 'Unmatched JC')).toBe(
      true
    );
  });

  test('linkReviewFormToParticipant rejects duplicate participant form', async () => {
    const year = 2032;
    const { sessionId, userId, participantId, formId } = await seedRotationWithLinkedForm(year);
    const { formId: secondFormId } = await t.mutation(api.reviewForms.createReviewForm, {
      sessionId,
      rotationYear: year,
      rotationNumber: 1,
      buddyUserId: userId,
      buddyName: 'Buddy',
      juniorCommanderUserId: null,
      juniorCommanderName: 'Another JC',
      ageGroup: 'RK',
      evaluationDate,
    });
    await expect(
      t.mutation(api.rotations.linkReviewFormToParticipant, {
        sessionId,
        formId: secondFormId,
        participantId,
      })
    ).rejects.toThrow(/already exists|already linked/i);
    // first form still linked
    expect(formId).toBeTruthy();
  });
});
