import { v } from 'convex/values';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { mutation, query } from './_generated/server';
import { getAuthUser } from '../modules/auth/getAuthUser';

/**
 * Public mutation to submit a JCEP application form.
 * Does NOT require authentication - anyone can submit.
 */
export const submitApplication = mutation({
  args: {
    fullName: v.string(),
    contactNumber: v.string(),
    ageGroupChoice1: v.union(
      v.literal('RK'),
      v.literal('DR'),
      v.literal('ARG / ARB'),
      v.literal('ER')
    ),
    reasonForChoice1: v.string(),
    ageGroupChoice2: v.optional(
      v.union(v.literal('RK'), v.literal('DR'), v.literal('ARG / ARB'), v.literal('ER'))
    ),
    reasonForChoice2: v.optional(v.string()),
    acknowledgedMottoAndPledge: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validation
    if (!args.fullName.trim()) {
      throw new Error('Full name is required');
    }
    if (!args.contactNumber.trim()) {
      throw new Error('Contact number is required');
    }
    if (!args.reasonForChoice1.trim()) {
      throw new Error('Reason for choice 1 is required');
    }
    if (!args.acknowledgedMottoAndPledge) {
      throw new Error('You must acknowledge the Royal Rangers Motto, Pledge, and Code');
    }

    // If choice 2 is provided, reason 2 must also be provided
    if (args.ageGroupChoice2 && !args.reasonForChoice2?.trim()) {
      throw new Error('Reason for choice 2 is required when age group choice 2 is selected');
    }

    const now = Date.now();
    const submissionYear = new Date(now).getFullYear();

    const applicationId = await ctx.db.insert('jcepApplications', {
      submittedAt: now,
      submissionYear,
      fullName: args.fullName.trim(),
      contactNumber: args.contactNumber.trim(),
      ageGroupChoice1: args.ageGroupChoice1,
      reasonForChoice1: args.reasonForChoice1.trim(),
      ageGroupChoice2: args.ageGroupChoice2 ?? null,
      reasonForChoice2: args.reasonForChoice2?.trim() ?? null,
      acknowledgedMottoAndPledge: args.acknowledgedMottoAndPledge,
    });

    return { success: true, applicationId };
  },
});

/**
 * Query to list all JCEP applications, grouped by submission year.
 * Requires authentication and system_admin access.
 */
export const listApplications = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Check authentication
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('You must be logged in to view applications');
    }

    // Check admin access
    if (user.accessLevel !== 'system_admin') {
      throw new Error('You must be a system admin to view applications');
    }

    // Fetch all applications, sorted by submitted date (descending)
    const applications = await ctx.db
      .query('jcepApplications')
      .withIndex('by_submitted_at')
      .order('desc')
      .collect();

    // Group by year
    const groupedByYear: Record<
      number,
      {
        _id: string;
        _creationTime: number;
        submittedAt: number;
        submissionYear: number;
        fullName: string;
        contactNumber: string;
        ageGroupChoice1: 'RK' | 'DR' | 'ARG / ARB' | 'ER';
        reasonForChoice1: string;
        ageGroupChoice2: 'RK' | 'DR' | 'ARG / ARB' | 'ER' | null;
        reasonForChoice2: string | null;
        acknowledgedMottoAndPledge: boolean;
      }[]
    > = {};

    for (const app of applications) {
      if (!groupedByYear[app.submissionYear]) {
        groupedByYear[app.submissionYear] = [];
      }
      groupedByYear[app.submissionYear].push(app);
    }

    // Sort years in descending order
    const years = Object.keys(groupedByYear)
      .map(Number)
      .sort((a, b) => b - a);

    return {
      groupedByYear,
      years,
      totalCount: applications.length,
    };
  },
});

/**
 * Query to get applications count by year (for dashboard summary).
 * Requires authentication and system_admin access.
 */
export const getApplicationsCountByYear = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Check authentication
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('You must be logged in to view application counts');
    }

    // Check admin access
    if (user.accessLevel !== 'system_admin') {
      throw new Error('You must be a system admin to view application counts');
    }

    // Fetch all applications
    const applications = await ctx.db.query('jcepApplications').collect();

    // Count by year
    const countByYear: Record<number, number> = {};
    for (const app of applications) {
      countByYear[app.submissionYear] = (countByYear[app.submissionYear] || 0) + 1;
    }

    // Sort years in descending order
    const years = Object.keys(countByYear)
      .map(Number)
      .sort((a, b) => b - a);

    return {
      countByYear,
      years,
      totalCount: applications.length,
    };
  },
});
