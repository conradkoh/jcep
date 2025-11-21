/**
 * JCEP Review Forms Backend API
 *
 * Manages the Junior Commander Exposure Programme rotation review forms.
 * Supports collaborative form completion between Buddies and Junior Commanders.
 */

import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';
import { getAuthUser } from '../modules/auth/getAuthUser';
import { mutation, query } from './_generated/server';

// Schema version constant
export const CURRENT_SCHEMA_VERSION = 1;

// Age group validator
const ageGroupValidator = v.union(
  v.literal('RK'),
  v.literal('DR'),
  v.literal('AR'),
  v.literal('ER')
);

// Review form status validator
const reviewFormStatusValidator = v.union(
  v.literal('draft'),
  v.literal('in_progress'),
  v.literal('submitted')
);

// Question response validator (captures question text with answer)
const questionResponseValidator = v.object({
  questionText: v.string(),
  answer: v.string(),
});

/**
 * Get a single review form by ID
 * Users can only access forms where they are the buddy or junior commander
 * Admins can access all forms
 */
export const getReviewForm = query({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      return null;
    }

    // Check access permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isBuddy = form.buddyUserId === user._id;
    const isJC = form.juniorCommanderUserId === user._id;

    if (!isAdmin && !isBuddy && !isJC) {
      throw new Error('Not authorized to view this form');
    }

    return form;
  },
});

/**
 * Get review forms by year for the current user
 * Returns forms where the user is either the buddy or junior commander
 */
export const getReviewFormsByYear = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get forms where user is buddy
    const buddyForms = await ctx.db
      .query('reviewForms')
      .withIndex('by_year_and_buddy', (q) =>
        q.eq('rotationYear', args.year).eq('buddyUserId', user._id)
      )
      .collect();

    // Get forms where user is JC
    const jcForms = await ctx.db
      .query('reviewForms')
      .withIndex('by_year_and_jc', (q) =>
        q.eq('rotationYear', args.year).eq('juniorCommanderUserId', user._id)
      )
      .collect();

    // Combine and deduplicate
    const allForms = [...buddyForms, ...jcForms];
    const uniqueForms = Array.from(new Map(allForms.map((form) => [form._id, form])).values());

    return uniqueForms.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get all review forms for a specific user (admin or self)
 */
export const getReviewFormsByUser = query({
  args: {
    ...SessionIdArg,
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const targetUserId = args.userId || user._id;

    // Only admins can view other users' forms
    if (targetUserId !== user._id && user.accessLevel !== 'system_admin') {
      throw new Error('Not authorized to view other users forms');
    }

    // Get forms where target user is buddy
    const buddyForms = await ctx.db
      .query('reviewForms')
      .withIndex('by_buddy', (q) => q.eq('buddyUserId', targetUserId))
      .collect();

    // Get forms where target user is JC
    const jcForms = await ctx.db
      .query('reviewForms')
      .withIndex('by_junior_commander', (q) => q.eq('juniorCommanderUserId', targetUserId))
      .collect();

    // Combine and deduplicate
    const allForms = [...buddyForms, ...jcForms];
    const uniqueForms = Array.from(new Map(allForms.map((form) => [form._id, form])).values());

    return uniqueForms.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get all review forms by year (admin only)
 * Supports optional filtering by status and age group
 */
export const getAllReviewFormsByYear = query({
  args: {
    ...SessionIdArg,
    year: v.number(),
    status: v.optional(reviewFormStatusValidator),
    ageGroup: v.optional(ageGroupValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Only admins can view all forms
    if (user.accessLevel !== 'system_admin') {
      throw new Error('Not authorized - admin access required');
    }

    // Query by year and optional status
    let query = ctx.db.query('reviewForms');

    if (args.status) {
      query = query.withIndex('by_year_and_status', (q) =>
        q.eq('rotationYear', args.year).eq('status', args.status)
      );
    } else {
      query = query.withIndex('by_rotation_year', (q) => q.eq('rotationYear', args.year));
    }

    let forms = await query.collect();

    // Filter by age group if specified
    if (args.ageGroup) {
      forms = forms.filter((form) => form.ageGroup === args.ageGroup);
    }

    return forms.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Create a new review form
 */
export const createReviewForm = mutation({
  args: {
    ...SessionIdArg,
    rotationYear: v.number(),
    buddyUserId: v.id('users'),
    buddyName: v.string(),
    juniorCommanderUserId: v.union(v.id('users'), v.null()),
    juniorCommanderName: v.string(),
    ageGroup: ageGroupValidator,
    evaluationDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Verify buddy user exists
    const buddyUser = await ctx.db.get(args.buddyUserId);
    if (!buddyUser) {
      throw new Error('Buddy user not found');
    }

    // Verify JC user exists if provided
    if (args.juniorCommanderUserId) {
      const jcUser = await ctx.db.get(args.juniorCommanderUserId);
      if (!jcUser) {
        throw new Error('Junior Commander user not found');
      }
    }

    const formId = await ctx.db.insert('reviewForms', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      rotationYear: args.rotationYear,
      buddyUserId: args.buddyUserId,
      buddyName: args.buddyName,
      juniorCommanderUserId: args.juniorCommanderUserId,
      juniorCommanderName: args.juniorCommanderName,
      ageGroup: args.ageGroup,
      evaluationDate: args.evaluationDate,
      nextRotationPreference: null,
      buddyEvaluation: null,
      jcReflection: null,
      jcFeedback: null,
      status: 'draft',
      submittedAt: null,
      submittedBy: null,
      createdBy: user._id,
    });

    return formId;
  },
});

/**
 * Update the particulars section of a review form
 * Only the creator or admin can update particulars
 */
export const updateParticulars = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
    buddyName: v.optional(v.string()),
    juniorCommanderName: v.optional(v.string()),
    ageGroup: v.optional(ageGroupValidator),
    evaluationDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isCreator = form.createdBy === user._id;

    if (!isAdmin && !isCreator) {
      throw new Error('Not authorized to update particulars');
    }

    const updates: Partial<typeof form> = {};
    if (args.buddyName !== undefined) updates.buddyName = args.buddyName;
    if (args.juniorCommanderName !== undefined)
      updates.juniorCommanderName = args.juniorCommanderName;
    if (args.ageGroup !== undefined) updates.ageGroup = args.ageGroup;
    if (args.evaluationDate !== undefined) updates.evaluationDate = args.evaluationDate;

    await ctx.db.patch(args.formId, updates);
  },
});

/**
 * Update the buddy evaluation section
 * Only the buddy or admin can update this section
 */
export const updateBuddyEvaluation = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
    tasksParticipated: questionResponseValidator,
    strengths: questionResponseValidator,
    areasForImprovement: questionResponseValidator,
    wordsOfEncouragement: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isBuddy = form.buddyUserId === user._id;

    if (!isAdmin && !isBuddy) {
      throw new Error('Not authorized to update buddy evaluation');
    }

    await ctx.db.patch(args.formId, {
      buddyEvaluation: {
        tasksParticipated: args.tasksParticipated,
        strengths: args.strengths,
        areasForImprovement: args.areasForImprovement,
        wordsOfEncouragement: args.wordsOfEncouragement,
        completedAt: Date.now(),
        completedBy: user._id,
      },
      status: 'in_progress',
    });
  },
});

/**
 * Update the Junior Commander reflection section
 * Only the JC or admin can update this section
 */
export const updateJCReflection = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
    nextRotationPreference: ageGroupValidator,
    activitiesParticipated: questionResponseValidator,
    learningsFromJCEP: questionResponseValidator,
    whatToDoDifferently: questionResponseValidator,
    goalsForNextRotation: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isJC = form.juniorCommanderUserId === user._id;

    if (!isAdmin && !isJC) {
      throw new Error('Not authorized to update JC reflection');
    }

    await ctx.db.patch(args.formId, {
      nextRotationPreference: args.nextRotationPreference,
      jcReflection: {
        activitiesParticipated: args.activitiesParticipated,
        learningsFromJCEP: args.learningsFromJCEP,
        whatToDoDifferently: args.whatToDoDifferently,
        goalsForNextRotation: args.goalsForNextRotation,
        completedAt: Date.now(),
        completedBy: user._id,
      },
      status: 'in_progress',
    });
  },
});

/**
 * Update the Junior Commander feedback section
 * Only the JC or admin can update this section
 */
export const updateJCFeedback = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
    gratitudeToBuddy: questionResponseValidator,
    programFeedback: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isJC = form.juniorCommanderUserId === user._id;

    if (!isAdmin && !isJC) {
      throw new Error('Not authorized to update JC feedback');
    }

    await ctx.db.patch(args.formId, {
      jcFeedback: {
        gratitudeToBuddy: args.gratitudeToBuddy,
        programFeedback: args.programFeedback,
        completedAt: Date.now(),
        completedBy: user._id,
      },
      status: 'in_progress',
    });
  },
});

/**
 * Submit a review form
 * Either the buddy or JC can submit once all sections are complete
 */
export const submitReviewForm = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if already submitted
    if (form.status === 'submitted') {
      throw new Error('Form already submitted');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isBuddy = form.buddyUserId === user._id;
    const isJC = form.juniorCommanderUserId === user._id;

    if (!isAdmin && !isBuddy && !isJC) {
      throw new Error('Not authorized to submit this form');
    }

    // Verify all sections are complete
    if (!form.buddyEvaluation) {
      throw new Error('Buddy evaluation section is incomplete');
    }
    if (!form.jcReflection) {
      throw new Error('Junior Commander reflection section is incomplete');
    }
    if (!form.jcFeedback) {
      throw new Error('Junior Commander feedback section is incomplete');
    }

    await ctx.db.patch(args.formId, {
      status: 'submitted',
      submittedAt: Date.now(),
      submittedBy: user._id,
    });
  },
});

/**
 * Delete a review form
 * Only the creator or admin can delete
 */
export const deleteReviewForm = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.sessionId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check permissions
    const isAdmin = user.accessLevel === 'system_admin';
    const isCreator = form.createdBy === user._id;

    if (!isAdmin && !isCreator) {
      throw new Error('Not authorized to delete this form');
    }

    await ctx.db.delete(args.formId);
  },
});
