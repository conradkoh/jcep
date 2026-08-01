import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);

/**
 * General-purpose runner to execute any migration by name.
 * Usage: npx convex run migrations:run '{fn: "migrations:myMigration"}'
 */
export const run = migrations.runner();

// ========================================
// Migration Definitions
// ========================================

/**
 * Migration: Remove deprecated session expiration fields.
 * Sets `expiresAt` and `expiresAtLabel` to undefined on all sessions.
 */
export const unsetSessionExpiration = migrations.define({
  table: 'sessions',
  migrateOne: async (_ctx, session) => {
    if (session.expiresAt !== undefined || session.expiresAtLabel !== undefined) {
      return {
        expiresAt: undefined,
        expiresAtLabel: undefined,
      };
    }
  },
});

/**
 * Migration: Set default access level for users.
 * Sets `accessLevel` to 'user' for all users where it is undefined.
 */
export const setUserAccessLevelDefault = migrations.define({
  table: 'users',
  migrateOne: async (_ctx, user) => {
    if (user.accessLevel === undefined) {
      return {
        accessLevel: 'user' as const,
      };
    }
  },
});

/**
 * Migration: Backfill roleNames from legacy accessLevel.
 * system_admin → ['system_admin'], all others → ['user'].
 */
export const backfillUserRoleNames = migrations.define({
  table: 'users',
  migrateOne: async (_ctx, user) => {
    if (user.roleNames !== undefined) {
      return;
    }
    const roleNames =
      user.accessLevel === 'system_admin' ? (['system_admin'] as const) : (['user'] as const);
    return { roleNames: [...roleNames] };
  },
});

/**
 * Migration: Strip legacy `manager` role from roleNames.
 * Starter now ships only `user` and `system_admin`; forks add custom roles.
 */
export const stripManagerRoleNames = migrations.define({
  table: 'users',
  migrateOne: async (_ctx, user) => {
    if (!user.roleNames?.includes('manager')) {
      return;
    }
    const filtered = user.roleNames.filter((role) => role !== 'manager');
    return { roleNames: filtered.length > 0 ? filtered : ['user'] };
  },
});

/**
 * Migration: Backfill rotationNumber from rotationQuarter on review forms.
 * Copies the deprecated rotationQuarter value into rotationNumber when missing.
 */
export const backfillReviewFormRotationNumber = migrations.define({
  table: 'reviewForms',
  migrateOne: async (_ctx, form) => {
    if (form.rotationNumber === undefined) {
      return {
        rotationNumber: form.rotationQuarter,
      };
    }
  },
});

/**
 * Migration: Verify all review forms have rotationNumber populated.
 * Safety net after backfillReviewFormRotationNumber — backfills from rotationQuarter
 * if still missing, throws if neither field is set.
 */
export const verifyReviewFormRotationNumber = migrations.define({
  table: 'reviewForms',
  migrateOne: async (_ctx, form) => {
    if (form.rotationNumber === undefined) {
      if (form.rotationQuarter === undefined) {
        throw new Error(
          `Review form ${form._id} is missing both rotationNumber and rotationQuarter`
        );
      }
      return { rotationNumber: form.rotationQuarter };
    }
  },
});

// ========================================
// Batch Runners
// ========================================

/**
 * Run all migrations in order.
 * Usage: npx convex run migrations:runAll
 */
/**
 * Migration: Clear buddyUserId on admin-generated rotation forms where the
 * admin was incorrectly assigned as buddy (buddy is text-only).
 * Heuristic: rotationParticipantId is set (admin flow) AND buddyUserId === createdBy.
 */
export const clearMisassignedBuddyOnReviewForms = migrations.define({
  table: 'reviewForms',
  migrateOne: async (_ctx, form) => {
    if (
      form.rotationParticipantId !== undefined &&
      form.buddyUserId !== null &&
      form.buddyUserId === form.createdBy
    ) {
      return { buddyUserId: null };
    }
  },
});

export const runAll = migrations.runner([
  internal.migrations.unsetSessionExpiration,
  internal.migrations.setUserAccessLevelDefault,
  internal.migrations.backfillUserRoleNames,
  internal.migrations.stripManagerRoleNames,
  internal.migrations.backfillReviewFormRotationNumber,
  internal.migrations.verifyReviewFormRotationNumber,
  internal.migrations.clearMisassignedBuddyOnReviewForms,
]);
