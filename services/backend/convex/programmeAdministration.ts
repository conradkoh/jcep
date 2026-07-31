import { v } from 'convex/values';
import type { SessionId } from 'convex-helpers/server/sessions';
import { SessionIdArg } from 'convex-helpers/server/sessions';

import { query } from './_generated/server';
import {
  APPLICATIONS_MANAGE_PERMISSION,
  requireAuthenticatedPermission,
} from '../application/auth';
import { getAuthUser } from '../modules/auth/getAuthUser';

// Hardcoded candidate data — replace with DB query when persistence is added
const HARDCODED_CANDIDATES = [
  {
    id: 'cand-001',
    fullName: 'Alex Tan',
    birthYear: 2010,
    contactNumber: '91234567',
    ageGroup: 'AR' as const,
  },
  {
    id: 'cand-002',
    fullName: 'Sarah Lim',
    birthYear: 2010,
    contactNumber: '92345678',
    ageGroup: 'ER' as const,
  },
  {
    id: 'cand-003',
    fullName: 'Marcus Wong',
    birthYear: 2010,
    contactNumber: '93456789',
    ageGroup: 'AR' as const,
  },
  {
    id: 'cand-004',
    fullName: 'Emily Koh',
    birthYear: 2011,
    contactNumber: '94567890',
    ageGroup: 'DR' as const,
  },
  {
    id: 'cand-005',
    fullName: 'Daniel Ng',
    birthYear: 2011,
    contactNumber: '95678901',
    ageGroup: 'AR' as const,
  },
  {
    id: 'cand-006',
    fullName: 'Priya Sharma',
    birthYear: 2012,
    contactNumber: '96789012',
    ageGroup: 'RK' as const,
  },
  {
    id: 'cand-007',
    fullName: 'Ryan Teo',
    birthYear: 2012,
    contactNumber: '97890123',
    ageGroup: 'DR' as const,
  },
];

async function requireApplicationsManage(
  ctx: Parameters<typeof getAuthUser>[0],
  args: { sessionId: SessionId }
) {
  const user = await getAuthUser(ctx, args);
  requireAuthenticatedPermission(user, APPLICATIONS_MANAGE_PERMISSION);
  return user;
}

export const listCandidateBatches = query({
  args: { ...SessionIdArg },
  handler: async (ctx, args) => {
    await requireApplicationsManage(ctx, args);
    const birthYears = [...new Set(HARDCODED_CANDIDATES.map((c) => c.birthYear))];
    return birthYears.sort((a, b) => b - a); // descending (newest batch first)
  },
});

export const listCandidatesByBatch = query({
  args: {
    ...SessionIdArg,
    birthYear: v.number(),
  },
  handler: async (ctx, args) => {
    await requireApplicationsManage(ctx, args);
    return HARDCODED_CANDIDATES.filter((c) => c.birthYear === args.birthYear);
  },
});
