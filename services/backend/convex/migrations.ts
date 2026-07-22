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

export const runAll = migrations.runner([
  internal.migrations.unsetSessionExpiration,
  internal.migrations.setUserAccessLevelDefault,
  internal.migrations.backfillReviewFormRotationNumber,
  internal.migrations.verifyReviewFormRotationNumber,
]);
