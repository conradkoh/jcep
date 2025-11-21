/**
 * Token-based access page for review forms.
 * Allows anonymous access via secret link.
 */

'use client';

import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ParticipantInfoCard } from '@/modules/review/components/ParticipantInfoCard';
import { ReviewFormRouter } from '@/modules/review/components/ReviewFormRouter';
import { useReviewFormByToken } from '@/modules/review/hooks/useReviewFormByToken';
import { useTokenAuth } from '@/modules/review/hooks/useTokenAuth';

export default function TokenAccessPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params.token === 'string' ? params.token : null;

  const { token: storedToken, setToken, isLoading: isTokenLoading } = useTokenAuth();
  const {
    form,
    accessLevel,
    isLoading: isFormLoading,
  } = useReviewFormByToken(token || storedToken);

  // Store token in localStorage when accessed via URL
  useEffect(() => {
    if (token && !isTokenLoading) {
      setToken(token);
    }
  }, [token, isTokenLoading, setToken]);

  // Loading state
  if (isTokenLoading || isFormLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (!form) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid or Expired Access Link</AlertTitle>
          <AlertDescription>
            This access link is invalid or has expired. Please contact your administrator for a new
            link.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Success - show form
  return (
    <div className="container mx-auto py-8 px-4">
      <a
        href="#review-form-content"
        className="sr-only inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to form sections
      </a>
      {/* Access level indicator */}
      <Alert className="mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Access Granted</AlertTitle>
        <AlertDescription>
          You are accessing this form as:{' '}
          <strong>{accessLevel === 'buddy' ? 'Buddy' : 'Junior Commander'}</strong>
        </AlertDescription>
      </Alert>

      {/* Participant information */}
      {accessLevel && <ParticipantInfoCard form={form} accessLevel={accessLevel} />}

      {/* Privacy notice */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Notice
          </CardTitle>
          <CardDescription>
            Your responses are private and will only be shared when the administrator chooses to
            reveal them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Your responses save automatically as you type.</li>
            <li>You can return to this link anytime to continue or edit your answers.</li>
            <li>
              {accessLevel === 'buddy'
                ? "The Junior Commander's responses stay hidden until the administrator reveals them."
                : "The Buddy's evaluation stays hidden until the administrator reveals it."}
            </li>
            <li>Keep this link private—anyone with it can access this form.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form content */}
      <div id="review-form-content">
        <ReviewFormRouter formId={form._id} accessToken={token} />
      </div>
    </div>
  );
}
