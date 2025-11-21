/**
 * JCEP Review Forms Backend API
 *
 * Manages the Junior Commander Exposure Programme rotation review forms.
 * Supports collaborative form completion between Buddies and Junior Commanders.
 */

import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';
import { getAuthUser } from '../modules/auth/getAuthUser';
import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { generateSecureToken, isTokenExpired } from './utils/tokenUtils';

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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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

    // V2: Filter responses based on visibility settings
    // Admins always see everything
    if (isAdmin) {
      return form;
    }

    // Filter buddy responses if JC shouldn't see them
    if (isJC && !form.buddyResponsesVisibleToJC) {
      return {
        ...form,
        buddyEvaluation: null,
      };
    }

    // Filter JC responses if buddy shouldn't see them
    if (isBuddy && !form.jcResponsesVisibleToBuddy) {
      return {
        ...form,
        jcReflection: null,
        jcFeedback: null,
      };
    }

    return form;
  },
});

/**
 * Get a review form by access token (for anonymous access)
 * Returns the form with appropriate filtering based on token type
 */
export const getReviewFormByToken = query({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find form by buddy token
    const formByBuddyToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_buddy_access_token', (q) => q.eq('buddyAccessToken', args.accessToken))
      .first();

    if (formByBuddyToken) {
      // Check if token has expired
      if (formByBuddyToken.tokenExpiresAt && Date.now() > formByBuddyToken.tokenExpiresAt) {
        throw new Error('Access token has expired');
      }

      // V2: Filter JC responses if buddy shouldn't see them
      const filteredForm = formByBuddyToken.jcResponsesVisibleToBuddy
        ? formByBuddyToken
        : {
            ...formByBuddyToken,
            jcReflection: null,
            jcFeedback: null,
          };

      // Return form with buddy access level
      return {
        form: filteredForm,
        accessLevel: 'buddy' as const,
      };
    }

    // Try to find form by JC token
    const formByJCToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_jc_access_token', (q) => q.eq('jcAccessToken', args.accessToken))
      .first();

    if (formByJCToken) {
      // Check if token has expired
      if (formByJCToken.tokenExpiresAt && Date.now() > formByJCToken.tokenExpiresAt) {
        throw new Error('Access token has expired');
      }

      // V2: Filter buddy responses if JC shouldn't see them
      const filteredForm = formByJCToken.buddyResponsesVisibleToJC
        ? formByJCToken
        : {
            ...formByJCToken,
            buddyEvaluation: null,
          };

      // Return form with JC access level
      return {
        form: filteredForm,
        accessLevel: 'jc' as const,
      };
    }

    // Token not found
    return null;
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
    quarter: v.optional(v.number()), // Optional quarter filter (1-4)
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    let buddyForms: Doc<'reviewForms'>[];
    let jcForms: Doc<'reviewForms'>[];

    if (args.quarter !== undefined) {
      const quarter = args.quarter; // Type narrowing
      // Get forms where user is buddy (with quarter filter)
      buddyForms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_quarter_and_buddy', (q) =>
          q.eq('rotationYear', args.year).eq('rotationQuarter', quarter).eq('buddyUserId', user._id)
        )
        .collect();

      // Get forms where user is JC (with quarter filter)
      jcForms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_quarter_and_jc', (q) =>
          q
            .eq('rotationYear', args.year)
            .eq('rotationQuarter', quarter)
            .eq('juniorCommanderUserId', user._id)
        )
        .collect();
    } else {
      // Get forms where user is buddy (no quarter filter)
      buddyForms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_and_buddy', (q) =>
          q.eq('rotationYear', args.year).eq('buddyUserId', user._id)
        )
        .collect();

      // Get forms where user is JC (no quarter filter)
      jcForms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_and_jc', (q) =>
          q.eq('rotationYear', args.year).eq('juniorCommanderUserId', user._id)
        )
        .collect();
    }

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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
 * Get all review forms where the user is a buddy
 * V2: For buddy aggregated view
 */
export const getReviewFormsByBuddy = query({
  args: {
    ...SessionIdArg,
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get forms where user is buddy
    const query = ctx.db
      .query('reviewForms')
      .withIndex('by_buddy', (q) => q.eq('buddyUserId', user._id));

    const forms = await query.collect();

    // Filter by year if provided
    const filteredForms = args.year
      ? forms.filter((form) => form.rotationYear === args.year)
      : forms;

    return filteredForms.sort((a, b) => b._creationTime - a._creationTime);
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
    quarter: v.optional(v.number()), // Optional quarter filter (1-4)
    status: v.optional(reviewFormStatusValidator),
    ageGroup: v.optional(ageGroupValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Only admins can view all forms
    if (user.accessLevel !== 'system_admin') {
      throw new Error('Not authorized - admin access required');
    }

    // Query by year, quarter (if provided), and optional status
    let forms: Doc<'reviewForms'>[];

    if (args.quarter !== undefined && args.status !== undefined) {
      // Both quarter and status specified - use combined index
      const quarter = args.quarter; // Type narrowing
      const status = args.status;
      forms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_quarter_and_status', (q) =>
          q.eq('rotationYear', args.year).eq('rotationQuarter', quarter).eq('status', status)
        )
        .collect();
    } else if (args.quarter !== undefined) {
      // Only quarter specified
      const quarter = args.quarter; // Type narrowing
      forms = await ctx.db
        .query('reviewForms')
        .withIndex('by_rotation_year_quarter', (q) =>
          q.eq('rotationYear', args.year).eq('rotationQuarter', quarter)
        )
        .collect();
    } else if (args.status !== undefined) {
      // Only status specified
      const status = args.status;
      forms = await ctx.db
        .query('reviewForms')
        .withIndex('by_year_and_status', (q) =>
          q.eq('rotationYear', args.year).eq('status', status)
        )
        .collect();
    } else {
      // Neither quarter nor status specified
      forms = await ctx.db
        .query('reviewForms')
        .withIndex('by_rotation_year', (q) => q.eq('rotationYear', args.year))
        .collect();
    }

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
    rotationQuarter: v.number(), // 1-4
    buddyUserId: v.id('users'),
    buddyName: v.string(),
    juniorCommanderUserId: v.union(v.id('users'), v.null()),
    juniorCommanderName: v.string(),
    ageGroup: ageGroupValidator,
    evaluationDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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

    // Generate secure access tokens
    const buddyAccessToken = generateSecureToken();
    const jcAccessToken = generateSecureToken();

    // Ensure tokens are unique (check for collisions)
    const existingBuddyToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_buddy_access_token', (q) => q.eq('buddyAccessToken', buddyAccessToken))
      .first();
    const existingJCToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_jc_access_token', (q) => q.eq('jcAccessToken', jcAccessToken))
      .first();

    if (existingBuddyToken || existingJCToken) {
      throw new Error('Token collision detected. Please try again.');
    }

    // Validate rotationQuarter is 1-4
    if (args.rotationQuarter < 1 || args.rotationQuarter > 4) {
      throw new Error('rotationQuarter must be between 1 and 4');
    }

    const formId = await ctx.db.insert('reviewForms', {
      schemaVersion: CURRENT_SCHEMA_VERSION,

      // V2: Access tokens
      buddyAccessToken,
      jcAccessToken,
      tokenExpiresAt: null, // No expiry by default

      // V2: Visibility control (default: hidden until admin reveals)
      buddyResponsesVisibleToJC: false,
      jcResponsesVisibleToBuddy: false,
      visibilityChangedAt: null,
      visibilityChangedBy: null,

      rotationYear: args.rotationYear,
      rotationQuarter: args.rotationQuarter,
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

    // Return form ID and tokens for admin to distribute
    const form = await ctx.db.get(formId);
    if (!form) {
      throw new Error('Failed to retrieve created form');
    }
    return {
      formId,
      buddyAccessToken: form.buddyAccessToken,
      jcAccessToken: form.jcAccessToken,
    };
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
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

/**
 * Regenerate access tokens for a review form (admin only)
 * Invalidates old tokens and generates new ones
 */
export const regenerateAccessTokens = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Only admins can regenerate tokens
    if (user.accessLevel !== 'system_admin') {
      throw new Error('Only admins can regenerate access tokens');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Generate new tokens
    const buddyAccessToken = generateSecureToken();
    const jcAccessToken = generateSecureToken();

    // Ensure tokens are unique
    const existingBuddyToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_buddy_access_token', (q) => q.eq('buddyAccessToken', buddyAccessToken))
      .first();
    const existingJCToken = await ctx.db
      .query('reviewForms')
      .withIndex('by_jc_access_token', (q) => q.eq('jcAccessToken', jcAccessToken))
      .first();

    if (existingBuddyToken || existingJCToken) {
      throw new Error('Token collision detected. Please try again.');
    }

    // Update form with new tokens
    await ctx.db.patch(args.formId, {
      buddyAccessToken,
      jcAccessToken,
    });

    return {
      buddyAccessToken,
      jcAccessToken,
    };
  },
});

/**
 * Toggle response visibility (admin only)
 * Controls whether buddy responses are visible to JC and vice versa
 */
export const toggleResponseVisibility = mutation({
  args: {
    ...SessionIdArg,
    formId: v.id('reviewForms'),
    buddyResponsesVisibleToJC: v.optional(v.boolean()),
    jcResponsesVisibleToBuddy: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Only admins can toggle visibility
    if (user.accessLevel !== 'system_admin') {
      throw new Error('Only admins can toggle response visibility');
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // At least one visibility flag must be provided
    if (
      args.buddyResponsesVisibleToJC === undefined &&
      args.jcResponsesVisibleToBuddy === undefined
    ) {
      throw new Error('At least one visibility flag must be provided');
    }

    // Update visibility settings
    const updates: Partial<Doc<'reviewForms'>> = {
      visibilityChangedAt: Date.now(),
      visibilityChangedBy: user._id,
    };

    if (args.buddyResponsesVisibleToJC !== undefined) {
      updates.buddyResponsesVisibleToJC = args.buddyResponsesVisibleToJC;
    }

    if (args.jcResponsesVisibleToBuddy !== undefined) {
      updates.jcResponsesVisibleToBuddy = args.jcResponsesVisibleToBuddy;
    }

    await ctx.db.patch(args.formId, updates);
  },
});

/**
 * Token-based mutations for anonymous access
 */

/**
 * Update buddy evaluation via access token
 */
export const updateBuddyEvaluationByToken = mutation({
  args: {
    accessToken: v.string(),
    formId: v.id('reviewForms'),
    tasksParticipated: questionResponseValidator,
    strengths: questionResponseValidator,
    areasForImprovement: questionResponseValidator,
    wordsOfEncouragement: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    // Verify token
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    if (form.buddyAccessToken !== args.accessToken) {
      throw new Error('Invalid access token');
    }

    // Check if token is expired
    if (isTokenExpired(form.tokenExpiresAt)) {
      throw new Error('Access token has expired');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    await ctx.db.patch(args.formId, {
      buddyEvaluation: {
        tasksParticipated: args.tasksParticipated,
        strengths: args.strengths,
        areasForImprovement: args.areasForImprovement,
        wordsOfEncouragement: args.wordsOfEncouragement,
        completedAt: Date.now(),
        completedBy: null, // Anonymous access
      },
      status: 'in_progress',
    });
  },
});

/**
 * Update JC reflection via access token
 */
export const updateJCReflectionByToken = mutation({
  args: {
    accessToken: v.string(),
    formId: v.id('reviewForms'),
    activitiesParticipated: questionResponseValidator,
    learningsFromJCEP: questionResponseValidator,
    whatToDoDifferently: questionResponseValidator,
    goalsForNextRotation: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    // Verify token
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    if (form.jcAccessToken !== args.accessToken) {
      throw new Error('Invalid access token');
    }

    // Check if token is expired
    if (isTokenExpired(form.tokenExpiresAt)) {
      throw new Error('Access token has expired');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    await ctx.db.patch(args.formId, {
      jcReflection: {
        activitiesParticipated: args.activitiesParticipated,
        learningsFromJCEP: args.learningsFromJCEP,
        whatToDoDifferently: args.whatToDoDifferently,
        goalsForNextRotation: args.goalsForNextRotation,
        completedAt: Date.now(),
        completedBy: null, // Anonymous access
      },
      status: 'in_progress',
    });
  },
});

/**
 * Update JC feedback via access token
 */
export const updateJCFeedbackByToken = mutation({
  args: {
    accessToken: v.string(),
    formId: v.id('reviewForms'),
    gratitudeToBuddy: questionResponseValidator,
    programFeedback: questionResponseValidator,
  },
  handler: async (ctx, args) => {
    // Verify token
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    if (form.jcAccessToken !== args.accessToken) {
      throw new Error('Invalid access token');
    }

    // Check if token is expired
    if (isTokenExpired(form.tokenExpiresAt)) {
      throw new Error('Access token has expired');
    }

    // Check if form is submitted
    if (form.status === 'submitted') {
      throw new Error('Cannot edit submitted form');
    }

    await ctx.db.patch(args.formId, {
      jcFeedback: {
        gratitudeToBuddy: args.gratitudeToBuddy,
        programFeedback: args.programFeedback,
        completedAt: Date.now(),
        completedBy: null, // Anonymous access
      },
      status: 'in_progress',
    });
  },
});
