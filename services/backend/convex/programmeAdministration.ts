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
  // Born 2012 (existing placeholders)
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
  // Born 2011 (existing placeholders)
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
  // Born 2010 (existing placeholders)
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
  // Born 2008
  { id: 'cand-032', fullName: 'Joyce Tan', birthYear: 2008 },
  { id: 'cand-033', fullName: 'Evangelynn Lim', birthYear: 2008 },
  { id: 'cand-034', fullName: "Ch'i Hui Tan", birthYear: 2008 },
  { id: 'cand-035', fullName: 'Lavie Tan', birthYear: 2008 },
  { id: 'cand-036', fullName: 'Sean Quek', birthYear: 2008 },
  { id: 'cand-037', fullName: 'Jonathan Ho', birthYear: 2008 },
  // Born 2007
  { id: 'cand-026', fullName: 'Elisabelle Lim', birthYear: 2007 },
  { id: 'cand-027', fullName: 'Eugenia Heng', birthYear: 2007 },
  { id: 'cand-028', fullName: 'Hannah Cheong', birthYear: 2007 },
  { id: 'cand-029', fullName: 'Jareb Seow', birthYear: 2007 },
  { id: 'cand-030', fullName: 'Jeremiah Chua', birthYear: 2007 },
  { id: 'cand-031', fullName: 'Nicholas Dubs', birthYear: 2007 },
  // Born 2006
  { id: 'cand-021', fullName: 'Emma Tiah', birthYear: 2006 },
  { id: 'cand-022', fullName: 'Joash Cheong', birthYear: 2006 },
  { id: 'cand-023', fullName: 'Katie Tan', birthYear: 2006 },
  { id: 'cand-024', fullName: 'Racheal Tan', birthYear: 2006 },
  { id: 'cand-025', fullName: 'Tan Chih-Yu', birthYear: 2006 },
  // Born 2005
  { id: 'cand-008', fullName: 'Grace Chan', birthYear: 2005 },
  { id: 'cand-009', fullName: 'Jacqueline Gabrielle', birthYear: 2005 },
  { id: 'cand-010', fullName: 'Jonadab Tan', birthYear: 2005 },
  { id: 'cand-011', fullName: 'Lim Han', birthYear: 2005 },
  { id: 'cand-012', fullName: 'Ranen Seow', birthYear: 2005 },
  { id: 'cand-013', fullName: 'Tan Tian Sheng', birthYear: 2005 },
  { id: 'cand-014', fullName: 'Brandon Lee', birthYear: 2005 },
  { id: 'cand-015', fullName: 'Chester Seah', birthYear: 2005 },
  { id: 'cand-016', fullName: 'Emmanuel Koh', birthYear: 2005 },
  { id: 'cand-017', fullName: 'Jonathan Lim', birthYear: 2005 },
  { id: 'cand-018', fullName: 'Joshel Lim', birthYear: 2005 },
  { id: 'cand-019', fullName: 'Meryl Lyn Pang', birthYear: 2005 },
  { id: 'cand-020', fullName: 'Raeanne Cheong', birthYear: 2005 },
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
