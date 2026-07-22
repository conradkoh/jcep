import { v } from 'convex/values';
import type { SessionId } from 'convex-helpers/server/sessions';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

const ageGroupValidator = v.union(
  v.literal('RK'),
  v.literal('DR'),
  v.literal('AR'),
  v.literal('ER')
);

async function requireSystemAdmin(
  ctx: Parameters<typeof getAuthUser>[0],
  args: { sessionId: SessionId }
) {
  const user = await getAuthUser(ctx, args);
  if (user.accessLevel !== 'system_admin') throw new Error('Admin only');
  return user;
}

export const listRotations = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const rotations = await ctx.db.query('rotations').order('desc').collect();
    return rotations.sort((a, b) => {
      if (a.rotationYear !== b.rotationYear) return b.rotationYear - a.rotationYear;
      return b.rotationQuarter - a.rotationQuarter;
    });
  },
});

export const getRotationWithParticipants = query({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotations'),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const rotation = await ctx.db.get('rotations', args.rotationId);
    if (!rotation) return null;
    const participants = await ctx.db
      .query('rotationParticipants')
      .withIndex('by_rotation', (q) => q.eq('rotationId', args.rotationId))
      .collect();
    return { rotation, participants };
  },
});

export const createRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationYear: v.number(),
    rotationQuarter: v.number(),
    evaluationDate: v.number(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    if (args.rotationQuarter < 1 || args.rotationQuarter > 4) {
      throw new Error('rotationQuarter must be between 1 and 4');
    }
    const existing = await ctx.db
      .query('rotations')
      .withIndex('by_year_quarter', (q) =>
        q.eq('rotationYear', args.rotationYear).eq('rotationQuarter', args.rotationQuarter)
      )
      .first();
    if (existing) {
      throw new Error('Rotation already exists for this year and quarter');
    }
    const rotationId = await ctx.db.insert('rotations', {
      rotationYear: args.rotationYear,
      rotationQuarter: args.rotationQuarter,
      evaluationDate: args.evaluationDate,
      label: args.label,
      createdAt: Date.now(),
      createdBy: (await requireSystemAdmin(ctx, args))._id,
    });
    return { rotationId };
  },
});

export const updateRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotations'),
    evaluationDate: v.number(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const rotation = await ctx.db.get('rotations', args.rotationId);
    if (!rotation) throw new Error('Rotation not found');
    await ctx.db.patch('rotations', args.rotationId, {
      evaluationDate: args.evaluationDate,
      label: args.label,
    });
  },
});

export const deleteRotation = mutation({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotations'),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const rotation = await ctx.db.get('rotations', args.rotationId);
    if (!rotation) throw new Error('Rotation not found');
    const participants = await ctx.db
      .query('rotationParticipants')
      .withIndex('by_rotation', (q) => q.eq('rotationId', args.rotationId))
      .collect();
    if (participants.length > 0) {
      throw new Error('Cannot delete rotation with participants. Remove all participants first.');
    }
    await ctx.db.delete('rotations', args.rotationId);
  },
});

export const searchApplicants = query({
  args: {
    ...SessionIdArg,
    searchTerm: v.string(),
    rotationId: v.optional(v.id('rotations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const trimmed = args.searchTerm.trim();
    if (trimmed.length < 2) return [];
    const maxResults = args.limit ?? 20;
    const allApplications = await ctx.db
      .query('jcepApplications')
      .withIndex('by_submitted_at')
      .order('desc')
      .collect();
    const nonArchived = allApplications.filter((app) => app.archivedAt == null);
    const lowerTerm = trimmed.toLowerCase();
    let matched = nonArchived.filter((app) => app.fullName.toLowerCase().includes(lowerTerm));
    const rotationId = args.rotationId;
    if (rotationId) {
      const existingParticipants = await ctx.db
        .query('rotationParticipants')
        .withIndex('by_rotation', (q) => q.eq('rotationId', rotationId))
        .collect();
      const existingAppIds = new Set(existingParticipants.map((p) => p.applicationId));
      matched = matched.filter((app) => !existingAppIds.has(app._id));
    }
    return matched.slice(0, maxResults).map((app) => ({
      _id: app._id,
      fullName: app.fullName,
      contactNumber: app.contactNumber,
      ageGroupChoice1: app.ageGroupChoice1,
      submissionYear: app.submissionYear,
    }));
  },
});

export const addParticipant = mutation({
  args: {
    ...SessionIdArg,
    rotationId: v.id('rotations'),
    applicationId: v.id('jcepApplications'),
    ageGroup: v.optional(ageGroupValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireSystemAdmin(ctx, args);
    const rotation = await ctx.db.get('rotations', args.rotationId);
    if (!rotation) throw new Error('Rotation not found');
    const application = await ctx.db.get('jcepApplications', args.applicationId);
    if (!application) throw new Error('Application not found');
    if (application.archivedAt != null) {
      throw new Error('Cannot add archived application to rotation');
    }
    const existing = await ctx.db
      .query('rotationParticipants')
      .withIndex('by_rotation_and_application', (q) =>
        q.eq('rotationId', args.rotationId).eq('applicationId', args.applicationId)
      )
      .first();
    if (existing) {
      throw new Error('Participant already exists on this rotation');
    }
    const participantId = await ctx.db.insert('rotationParticipants', {
      rotationId: args.rotationId,
      applicationId: args.applicationId,
      fullName: application.fullName,
      contactNumber: application.contactNumber,
      ageGroup: args.ageGroup ?? application.ageGroupChoice1,
      addedAt: Date.now(),
      addedBy: user._id,
    });
    return { participantId };
  },
});

export const removeParticipant = mutation({
  args: {
    ...SessionIdArg,
    participantId: v.id('rotationParticipants'),
  },
  handler: async (ctx, args) => {
    await requireSystemAdmin(ctx, args);
    const participant = await ctx.db.get('rotationParticipants', args.participantId);
    if (!participant) throw new Error('Participant not found');
    await ctx.db.delete('rotationParticipants', args.participantId);
  },
});
