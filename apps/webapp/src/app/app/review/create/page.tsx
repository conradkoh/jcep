'use client';

import { useSearchParams } from 'next/navigation';

import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormCreate } from '@/modules/review/components/v1/ReviewFormCreate';

const RETURN_TO_PATHS: Record<string, string> = {
  'review-management': '/app/review-management',
};

/**
 * Content component for the review form creation page.
 */
// fallow-ignore-next-line complexity
function ReviewCreatePageContent() {
  const authState = useAuthState();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const redirectTo = returnTo ? (RETURN_TO_PATHS[returnTo] ?? '/app/review') : '/app/review';

  if (!authState || authState.state !== 'authenticated') {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <ReviewFormCreate currentUserId={authState.user._id} redirectTo={redirectTo} />
    </div>
  );
}

/**
 * Review form creation page component.
 * Requires authentication and displays the form creation interface.
 */
export default function ReviewCreatePage() {
  return (
    <RequireLogin>
      <ReviewCreatePageContent />
    </RequireLogin>
  );
}
