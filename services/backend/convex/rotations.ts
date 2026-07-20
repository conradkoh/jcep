/**
 * Rotations Backend API
 *
 * Manages rotations for bulk review form generation.
 * Each rotation links a year/quarter to an evaluation date.
 */

import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

/**
 * List all rotations, ordered by year and quarter descending.
 * Admin only.
 */
export const listRotations = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    const rotations = await ctx.db
      .query('rotationMappings')
      .withIndex('by_year', (q) => q)
      .collect();

    // Sort by year desc, then quarter desc
    return rotations.sort((a, b) => {
      if (a.rotationYear !== b.rotationYear) {
        return b.rotationYear - a.rotationYear;
      }
      return b.rotationQuarter - a.rotationQuarter;
    });
  },
});

/**
 * Get a rotation by year and quarter.
 * Admin only.
 */
export const getRotationByYearQuarter = query({
  args: {
    ...SessionIdArg,
    rotationYear: v.number(),
    rotationQuarter: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    const rotation = await ctx.db
      .query('rotationMappings')
      .withIndex('by_year_quarter', (q) =>
        q.eq('rotationYear', args.rotationYear).eq('rotationQuarter', args.rotationQuarter)
      )
      .first();

    return rotation;
  },
});

/**
 * Create a new rotation.
 * Admin only.
 */
export const createRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationYear: v.number(),
    rotationQuarter: v.number(),
    evaluationDate: v.number(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    // Validate quarter is 1-4
    if (args.rotationQuarter < 1 || args.rotationQuarter > 4) {
      throw new Error('rotationQuarter must be between 1 and 4');
    }

    // Check for duplicate year/quarter
    const existing = await ctx.db
      .query('rotationMappings')
      .withIndex('by_year_quarter', (q) =>
        q.eq('rotationYear', args.rotationYear).eq('rotationQuarter', args.rotationQuarter)
      )
      .first();

    if (existing) {
      throw new Error('Rotation already exists for this year and quarter');
    }

    const rotationId = await ctx.db.insert('rotationMappings', {
      rotationYear: args.rotationYear,
      rotationQuarter: args.rotationQuarter,
      evaluationDate: args.evaluationDate,
      label: args.label,
      createdAt: Date.now(),
      createdBy: user._id,
    });

    return rotationId;
  },
});

/**
 * Update a rotation.
 * Admin only.
 */
export const updateRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotationMappings'),
    evaluationDate: v.optional(v.number()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    const existing = await ctx.db.get('rotationMappings', args.rotationId);
    if (!existing) {
      throw new Error('Rotation not found');
    }

    const updates: Partial<typeof existing> = {};
    if (args.evaluationDate !== undefined) {
      updates.evaluationDate = args.evaluationDate;
    }
    if (args.label !== undefined) {
      updates.label = args.label;
    }

    await ctx.db.patch('rotationMappings', args.rotationId, updates);
  },
});

/**
 * Delete a rotation.
 * Admin only.
 */
export const deleteRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotationMappings'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    const existing = await ctx.db.get('rotationMappings', args.rotationId);
    if (!existing) {
      throw new Error('Rotation not found');
    }

    await ctx.db.delete('rotationMappings', args.rotationId);
  },
});
