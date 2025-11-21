'use client';

import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormCreate } from '@/modules/review/components/v1/ReviewFormCreate';

function ReviewCreatePageContent() {
  const authState = useAuthState();

  if (!authState || authState.state !== 'authenticated') {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <ReviewFormCreate currentUserId={authState.user._id} />
    </div>
  );
}

export default function ReviewCreatePage() {
  return (
    <RequireLogin>
      <ReviewCreatePageContent />
    </RequireLogin>
  );
}
