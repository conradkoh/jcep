import { v } from 'convex/values';

import { internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery } from './_generated/server';

const BATCH_SIZE = 100; // Process 100 sessions per batch

interface PaginationOpts {
  numItems: number;
  cursor: string | null;
}

/**
 * Internal mutation to remove deprecated expiration fields from a single session.
 * Part of the session expiration deprecation migration.
 */
export const unsetSessionExpiration = internalMutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch('sessions', args.sessionId, {
      expiresAt: undefined,
      expiresAtLabel: undefined,
    });
  },
});

/**
 * Internal action to migrate all sessions by removing deprecated expiration fields.
 * Processes sessions in batches to avoid timeout issues.
 */
export const migrateUnsetSessionExpiration = internalAction({
  args: { cursor: v.optional(v.string()) }, // Convex cursor for pagination
  handler: async (ctx, args) => {
    const paginationOpts: PaginationOpts = {
      numItems: BATCH_SIZE,
      cursor: args.cursor ?? null,
    };

    // Fetch a batch of sessions
    const results = await ctx.runQuery(internal.migration.getSessionsBatch, {
      paginationOpts,
    });

    // Schedule mutations to update each session in the batch
    for (const session of results.page) {
      await ctx.runMutation(internal.migration.unsetSessionExpiration, {
        sessionId: session._id,
      });
    }

    // If there are more sessions, schedule the next batch
    if (!results.isDone) {
      await ctx.runAction(internal.migration.migrateUnsetSessionExpiration, {
        cursor: results.continueCursor,
      });
    }
  },
});

/**
 * Helper query to fetch sessions in batches for pagination during migration.
 */
export const getSessionsBatch = internalQuery({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query('sessions').paginate(args.paginationOpts);
  },
});

// ========================================
// USER ACCESS LEVEL MIGRATION
// ========================================

/**
 * Internal mutation to set default accessLevel for a user if currently undefined.
 * Part of the user access level migration to ensure all users have explicit access levels.
 */
export const setUserAccessLevelDefault = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get('users', args.userId);
    if (!user) {
      return; // User doesn't exist, skip
    }

    // Only update if accessLevel is undefined
    if (user.accessLevel === undefined) {
      await ctx.db.patch('users', args.userId, {
        accessLevel: 'user',
      });
    }
  },
});

/**
 * Internal mutation to set all users with undefined accessLevel to 'user' in a single batch.
 * Updates are executed in parallel for better performance.
 * WARNING: This processes all users at once and may timeout for large user bases.
 * For large datasets, use migrateUserAccessLevels (action) instead.
 *
 * @returns Object with count of users updated
 */
export const setAllUndefinedAccessLevelsToUser = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Fetch all users with undefined accessLevel
    const allUsers = await ctx.db.query('users').collect();

    // Filter users that need updating
    const usersToUpdate = allUsers.filter((user) => user.accessLevel === undefined);

    // Update all users in parallel
    await Promise.all(
      usersToUpdate.map((user) =>
        ctx.db.patch('users', user._id, {
          accessLevel: 'user',
        })
      )
    );

    console.log(
      `Migration complete: Updated ${usersToUpdate.length} users to accessLevel: 'user' (out of ${allUsers.length} total users)`
    );

    return {
      success: true,
      updatedCount: usersToUpdate.length,
      totalUsers: allUsers.length,
    };
  },
});

/**
 * Internal action to migrate all users to have explicit accessLevel values.
 * Sets undefined accessLevel fields to 'user' as the default.
 * Processes users in batches to handle large datasets safely.
 * Updates within each batch are executed in parallel for better performance.
 */
export const migrateUserAccessLevels = internalAction({
  args: { cursor: v.optional(v.string()) }, // Convex cursor for pagination
  handler: async (ctx, args) => {
    const paginationOpts: PaginationOpts = {
      numItems: BATCH_SIZE,
      cursor: args.cursor ?? null,
    };

    // Fetch a batch of users
    const results = await ctx.runQuery(internal.migration.getUsersBatch, {
      paginationOpts,
    });

    // Filter users that need updating
    const usersToUpdate = results.page.filter((user) => user.accessLevel === undefined);

    // Schedule mutations to update all users in the batch in parallel
    await Promise.all(
      usersToUpdate.map((user) =>
        ctx.runMutation(internal.migration.setUserAccessLevelDefault, {
          userId: user._id,
        })
      )
    );

    console.log(`Processed batch: ${results.page.length} users, updated: ${usersToUpdate.length}`);

    // If there are more users, schedule the next batch
    if (!results.isDone) {
      await ctx.runAction(internal.migration.migrateUserAccessLevels, {
        cursor: results.continueCursor,
      });
    } else {
      console.log('User access level migration completed');
    }
  },
});

/**
 * Helper query to fetch users in batches for pagination during migration.
 */
export const getUsersBatch = internalQuery({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query('users').paginate(args.paginationOpts);
  },
});

// ========================================
// REVIEW FORM ROTATION QUARTER MIGRATION
// ========================================

/**
 * Internal mutation to add rotationQuarter field to a review form if missing.
 * Sets the default value to 1 for all existing forms.
 */
export const setReviewFormQuarterDefault = internalMutation({
  args: { formId: v.id('reviewForms') },
  handler: async (ctx, args) => {
    const form = await ctx.db.get('reviewForms', args.formId);
    if (!form) {
      return; // Form doesn't exist, skip
    }

    // Only update if rotationQuarter is undefined (shouldn't happen after migration)
    if (form.rotationQuarter === undefined) {
      await ctx.db.patch('reviewForms', args.formId, {
        rotationQuarter: 1, // Default to Q1 for all existing forms
      });
    }
  },
});

/**
 * Internal action to migrate all review forms to include rotationQuarter field.
 * Sets undefined rotationQuarter fields to 1 (Q1) as the default.
 * Processes forms in batches to handle large datasets safely.
 */
export const migrateReviewFormsToQuarters = internalAction({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const paginationOpts: PaginationOpts = {
      numItems: BATCH_SIZE,
      cursor: args.cursor ?? null,
    };

    // Fetch a batch of review forms
    const results = await ctx.runQuery(internal.migration.getReviewFormsBatch, {
      paginationOpts,
    });

    // Schedule mutations to update all forms in the batch in parallel
    await Promise.all(
      results.page.map((form) =>
        ctx.runMutation(internal.migration.setReviewFormQuarterDefault, {
          formId: form._id,
        })
      )
    );

    console.log(`Processed batch: ${results.page.length} review forms, migrating rotationQuarter`);

    // If there are more forms, schedule the next batch
    if (!results.isDone) {
      await ctx.runAction(internal.migration.migrateReviewFormsToQuarters, {
        cursor: results.continueCursor,
      });
    } else {
      console.log('Review form rotation quarter migration completed');
    }
  },
});

/**
 * Helper query to fetch review forms in batches for pagination during migration.
 */
export const getReviewFormsBatch = internalQuery({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query('reviewForms').paginate(args.paginationOpts);
  },
});
