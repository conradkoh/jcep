'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { SUPPORTED_SCHEMA_VERSIONS } from '../constants/schemaVersions';
import { useReviewForm } from '../hooks/useReviewForm';
import { useReviewFormByToken } from '../hooks/useReviewFormByToken';
import { ReviewFormView as V1ReviewFormView } from './v1/ReviewFormView';

interface ReviewFormRouterProps {
  formId: Id<'reviewForms'>;
  accessToken?: string | null;
}

/**
 * Routes to the correct version of the review form based on schema version
 */
export function ReviewFormRouter({ formId, accessToken }: ReviewFormRouterProps) {
  // Use token-based access if token is provided, otherwise use session-based access
  const sessionBasedData = useReviewForm(accessToken ? null : formId);
  const tokenBasedData = useReviewFormByToken(accessToken);

  const { form, isLoading } = accessToken ? tokenBasedData : sessionBasedData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-lg font-semibold text-foreground">Form Not Found</p>
        <p className="text-sm text-muted-foreground">
          The review form you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  // Check if schema version is supported
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(form.schemaVersion as 1)) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-lg font-semibold text-foreground">Unsupported Form Version</p>
        <p className="text-sm text-muted-foreground">
          This form uses schema version {form.schemaVersion}, which is not supported by this version
          of the application.
        </p>
      </div>
    );
  }

  // Route to the appropriate version component
  switch (form.schemaVersion) {
    case 1:
      return <V1ReviewFormView formId={formId} accessToken={accessToken} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-lg font-semibold text-foreground">Unknown Form Version</p>
          <p className="text-sm text-muted-foreground">
            Schema version {form.schemaVersion} is not recognized.
          </p>
        </div>
      );
  }
}
