'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { BulkReviewFormCreate } from '@/modules/review/components/v1/BulkReviewFormCreate';
import { ReviewFormCreate } from '@/modules/review/components/v1/ReviewFormCreate';

type CreateMode = 'single' | 'bulk';

/**
 * Content component for the review form creation page.
 * Displays the review form creation interface for authenticated users.
 */
function ReviewCreatePageContent() {
  const authState = useAuthState();
  const [mode, setMode] = useState<CreateMode>('single');

  if (!authState || authState.state !== 'authenticated') {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <Button
            variant={mode === 'single' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('single')}
          >
            Single
          </Button>
          <Button
            variant={mode === 'bulk' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('bulk')}
          >
            Bulk
          </Button>
        </div>
      </div>
      {mode === 'single' ? (
        <ReviewFormCreate currentUserId={authState.user._id} />
      ) : (
        <BulkReviewFormCreate currentUserId={authState.user._id} />
      )}
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
