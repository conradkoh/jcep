import type { SessionId } from 'convex-helpers/server/sessions';

import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { t } from '../test.setup';

export type UserRoleSetup = {
  accessLevel?: 'user' | 'system_admin';
  roleNames?: string[];
};

export async function loginFresh(): Promise<{ sessionId: SessionId; userId: Id<'users'> }> {
  const sessionId = `sess-${Math.random().toString(36).slice(2)}` as SessionId;
  const login = await t.mutation(api.auth.loginAnon, { sessionId });
  if (!login.success) {
    throw new Error('loginAnon failed in test setup');
  }
  return { sessionId, userId: login.userId as Id<'users'> };
}

export async function setUserRoles(userId: Id<'users'>, roles: UserRoleSetup): Promise<void> {
  await t.run(async (ctx) => {
    const patch: Record<string, unknown> = {};
    if (roles.accessLevel !== undefined) {
      patch.accessLevel = roles.accessLevel;
    }
    if (roles.roleNames !== undefined) {
      patch.roleNames = roles.roleNames;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }
  });
}

/** Login and optionally patch roles in one call. */
export async function loginAs(roles: UserRoleSetup = {}): Promise<{
  sessionId: SessionId;
  userId: Id<'users'>;
}> {
  const { sessionId, userId } = await loginFresh();
  await setUserRoles(userId, roles);
  return { sessionId, userId };
}
