/**
 * Rotation Mappings Backend API
 *
 * Manages rotation mappings for bulk review form generation.
 * Provides CRUD operations for rotationYear/Quarter to evaluationDate mappings.
 */

import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

/**
 * List all rotation mappings, ordered by year and quarter descending.
 * Admin only.
 */
export const listRotationMappings = query({
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

    const mappings = await ctx.db
      .query('rotationMappings')
      .withIndex('by_year', (q) => q)
      .collect();

    // Sort by year desc, then quarter desc
    return mappings.sort((a, b) => {
      if (a.rotationYear !== b.rotationYear) {
        return b.rotationYear - a.rotationYear;
      }
      return b.rotationQuarter - a.rotationQuarter;
    });
  },
});

/**
 * Get a rotation mapping by year and quarter.
 * Admin only.
 */
export const getRotationMappingByYearQuarter = query({
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

    const mapping = await ctx.db
      .query('rotationMappings')
      .withIndex('by_year_quarter', (q) =>
        q.eq('rotationYear', args.rotationYear).eq('rotationQuarter', args.rotationQuarter)
      )
      .first();

    return mapping;
  },
});

/**
 * Create a new rotation mapping.
 * Admin only.
 */
export const createRotationMapping = mutation({
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
      throw new Error('Rotation mapping already exists for this year and quarter');
    }

    const mappingId = await ctx.db.insert('rotationMappings', {
      rotationYear: args.rotationYear,
      rotationQuarter: args.rotationQuarter,
      evaluationDate: args.evaluationDate,
      label: args.label,
      createdAt: Date.now(),
      createdBy: user._id,
    });

    return mappingId;
  },
});

/**
 * Update a rotation mapping.
 * Admin only.
 */
export const updateRotationMapping = mutation({
  args: {
    ...SessionIdArg,
    mappingId: v.id('rotationMappings'),
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

    const existing = await ctx.db.get('rotationMappings', args.mappingId);
    if (!existing) {
      throw new Error('Rotation mapping not found');
    }

    const updates: Partial<typeof existing> = {};
    if (args.evaluationDate !== undefined) {
      updates.evaluationDate = args.evaluationDate;
    }
    if (args.label !== undefined) {
      updates.label = args.label;
    }

    await ctx.db.patch('rotationMappings', args.mappingId, updates);
  },
});

/**
 * Delete a rotation mapping.
 * Admin only.
 */
export const deleteRotationMapping = mutation({
  args: {
    ...SessionIdArg,
    mappingId: v.id('rotationMappings'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('Admin only');
    }

    const existing = await ctx.db.get('rotationMappings', args.mappingId);
    if (!existing) {
      throw new Error('Rotation mapping not found');
    }

    await ctx.db.delete('rotationMappings', args.mappingId);
  },
});
