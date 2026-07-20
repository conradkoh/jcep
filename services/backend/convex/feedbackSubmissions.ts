import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

/**
 * Submit feedback via the standalone feedback form.
 * Requires authentication.
 */
export const submitFeedback = mutation({
  args: {
    ...SessionIdArg,
    respondentName: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('You must be logged in to submit feedback');
    }

    const message = args.message.trim();
    if (!message) {
      throw new Error('Feedback message is required');
    }

    const respondentName = args.respondentName?.trim() || undefined;

    const submissionId = await ctx.db.insert('feedbackSubmissions', {
      respondentName,
      message,
      submittedAt: Date.now(),
      userId: user._id,
    });

    return { success: true, submissionId };
  },
});

/**
 * List all feedback submissions, newest first.
 * System admin only.
 */
export const listFeedbackSubmissions = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, { sessionId: args.sessionId });
    if (!user) {
      throw new Error('You must be logged in to view feedback');
    }

    if (user.accessLevel !== 'system_admin') {
      throw new Error('You must be a system admin to view feedback');
    }

    return await ctx.db
      .query('feedbackSubmissions')
      .withIndex('by_submitted_at')
      .order('desc')
      .collect();
  },
});
