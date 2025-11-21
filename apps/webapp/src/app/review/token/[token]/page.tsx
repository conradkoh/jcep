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
      {/* Access level indicator */}
      <Alert className="mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Access Granted</AlertTitle>
        <AlertDescription>
          You are accessing this form as:{' '}
          <strong>{accessLevel === 'buddy' ? 'Buddy' : 'Junior Commander'}</strong>
          {accessLevel === 'buddy' && ` for ${form.juniorCommanderName}`}
          {accessLevel === 'jc' && ` (${form.juniorCommanderName})`}
        </AlertDescription>
      </Alert>

      {/* Privacy notice */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Notice
          </CardTitle>
          <CardDescription>
            Your responses are private and will only be shared when the administrator makes them
            available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Your responses are saved automatically as you type</li>
            <li>You can return to this link anytime to edit your responses</li>
            <li>
              {accessLevel === 'buddy'
                ? "The Junior Commander's responses are hidden until the administrator reveals them"
                : "The Buddy's evaluation is hidden until the administrator reveals it"}
            </li>
            <li>Keep this link private - anyone with this link can access this form</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form content */}
      <ReviewFormRouter formId={form._id} />
    </div>
  );
}
