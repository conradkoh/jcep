import { describe, expect, test } from 'vitest';

import { loginAs } from '../test-utils/auth';
import { t } from '../test.setup';
import { api } from './_generated/api';

describe('programme admin permission enforcement', () => {
  describe('rotations:manage — listRotations', () => {
    test('denies plain user', async () => {
      const { sessionId } = await loginAs();
      await expect(t.query(api.rotations.listRotations, { sessionId })).rejects.toMatchObject({
        data: { code: 'FORBIDDEN' },
      });
    });

    test('allows jcep_admin', async () => {
      const { sessionId } = await loginAs({ roleNames: ['jcep_admin'] });
      const result = await t.query(api.rotations.listRotations, { sessionId });
      expect(Array.isArray(result)).toBe(true);
    });

    test('allows system_admin', async () => {
      const { sessionId } = await loginAs({ accessLevel: 'system_admin' });
      const result = await t.query(api.rotations.listRotations, { sessionId });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('applications:manage — listApplications', () => {
    test('denies plain user', async () => {
      const { sessionId } = await loginAs();
      await expect(
        t.query(api.jcepApplications.listApplications, { sessionId })
      ).rejects.toMatchObject({
        data: { code: 'FORBIDDEN' },
      });
    });

    test('allows jcep_admin', async () => {
      const { sessionId } = await loginAs({ roleNames: ['jcep_admin'] });
      const result = await t.query(api.jcepApplications.listApplications, { sessionId });
      expect(result).toBeDefined();
    });

    test('allows system_admin', async () => {
      const { sessionId } = await loginAs({ accessLevel: 'system_admin' });
      const result = await t.query(api.jcepApplications.listApplications, { sessionId });
      expect(result).toBeDefined();
    });
  });

  describe('reviews:manage — getAllReviewFormsByYear', () => {
    const year = new Date().getFullYear();

    test('denies plain user', async () => {
      const { sessionId } = await loginAs();
      await expect(
        t.query(api.reviewForms.getAllReviewFormsByYear, { sessionId, year })
      ).rejects.toThrow(/admin access required/);
    });

    test('allows jcep_admin', async () => {
      const { sessionId } = await loginAs({ roleNames: ['jcep_admin'] });
      const result = await t.query(api.reviewForms.getAllReviewFormsByYear, { sessionId, year });
      expect(Array.isArray(result)).toBe(true);
    });

    test('allows system_admin', async () => {
      const { sessionId } = await loginAs({ accessLevel: 'system_admin' });
      const result = await t.query(api.reviewForms.getAllReviewFormsByYear, { sessionId, year });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
