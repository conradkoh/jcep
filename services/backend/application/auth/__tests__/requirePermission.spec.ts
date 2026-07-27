import { ConvexError } from 'convex/values';
import { describe, expect, it } from 'vitest';

import { AUTH_PROVIDER_MANAGE_PERMISSION, APPLICATIONS_MANAGE_PERMISSION } from '../permissions';
import { requireAuthenticatedPermission, requirePermissionForUser } from '../requirePermission';

describe('requirePermissionForUser', () => {
  it('throws FORBIDDEN when permission is missing', () => {
    expect(() =>
      requirePermissionForUser({ accessLevel: 'user' }, APPLICATIONS_MANAGE_PERMISSION)
    ).toThrow(ConvexError);
    try {
      requirePermissionForUser({ accessLevel: 'user' }, APPLICATIONS_MANAGE_PERMISSION);
    } catch (error) {
      expect(error).toMatchObject({
        data: { code: 'FORBIDDEN', message: expect.stringContaining('applications:manage') },
      });
    }
  });

  it('allows jcep_admin via roleNames', () => {
    expect(() =>
      requirePermissionForUser(
        { accessLevel: 'user', roleNames: ['jcep_admin'] },
        APPLICATIONS_MANAGE_PERMISSION
      )
    ).not.toThrow();
  });

  it('denies jcep_admin system-admin permissions', () => {
    expect(() =>
      requirePermissionForUser(
        { accessLevel: 'user', roleNames: ['jcep_admin'] },
        AUTH_PROVIDER_MANAGE_PERMISSION
      )
    ).toThrow(ConvexError);
  });
});

describe('requireAuthenticatedPermission', () => {
  it('throws UNAUTHORIZED when user is null', () => {
    expect(() => requireAuthenticatedPermission(null, APPLICATIONS_MANAGE_PERMISSION)).toThrow(
      ConvexError
    );
    try {
      requireAuthenticatedPermission(null, APPLICATIONS_MANAGE_PERMISSION);
    } catch (error) {
      expect(error).toMatchObject({ data: { code: 'UNAUTHORIZED' } });
    }
  });

  it('allows system_admin', () => {
    expect(() =>
      requireAuthenticatedPermission(
        { accessLevel: 'system_admin' },
        AUTH_PROVIDER_MANAGE_PERMISSION
      )
    ).not.toThrow();
  });
});
