import { render, screen } from '@testing-library/react';
import type { Doc, Id } from '@workspace/backend/convex/_generated/dataModel';
import type { AuthState } from '@workspace/backend/modules/auth/types/AuthState';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Navigation } from './Navigation';

// Mock the auth module
vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuthState: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock UserMenu component
vi.mock('@/components/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

// Mock feature flags
vi.mock('@workspace/backend/config/featureFlags', () => ({
  featureFlags: {
    disableLogin: false,
  },
}));

import { useAuthState } from '@/modules/auth/AuthProvider';

const createUnauthenticatedState = (): AuthState => ({
  sessionId: 'test-session',
  state: 'unauthenticated',
  reason: 'not_authenticated',
});

const createAuthenticatedState = (): AuthState => ({
  sessionId: 'test-session',
  state: 'authenticated',
  user: {
    _id: 'user_1' as Id<'users'>,
    _creationTime: Date.now(),
  } as Doc<'users'>,
  accessLevel: 'user',
  isSystemAdmin: false,
});

describe('Navigation', () => {
  it('renders title link to "/" when user is not authenticated', () => {
    vi.mocked(useAuthState).mockReturnValue(createUnauthenticatedState());

    render(<Navigation />);

    const titleLink = screen.getByRole('link', { name: /next convex/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('renders title link to "/app" when user is authenticated', () => {
    vi.mocked(useAuthState).mockReturnValue(createAuthenticatedState());

    render(<Navigation />);

    const titleLink = screen.getByRole('link', { name: /next convex/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/app');
  });

  it('renders login button when user is not authenticated', () => {
    vi.mocked(useAuthState).mockReturnValue(createUnauthenticatedState());

    render(<Navigation />);

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('renders user menu when user is authenticated', () => {
    vi.mocked(useAuthState).mockReturnValue(createAuthenticatedState());

    render(<Navigation />);

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('renders nothing when auth state is loading', () => {
    vi.mocked(useAuthState).mockReturnValue(undefined);

    render(<Navigation />);

    // Should not render login button or user menu
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });
});
