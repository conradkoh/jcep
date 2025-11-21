import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormRouter } from '@/modules/review/components/ReviewFormRouter';

/**
 * Props for the review detail page component.
 */
export interface ReviewDetailPageProps {
  /** Promise containing the form ID from the route parameters */
  params: Promise<{ formId: Id<'reviewForms'> }>;
}

/**
 * Content component for the review detail page.
 * Displays the review form router for the specified form ID.
 */
async function _ReviewDetailPageContent({ params }: ReviewDetailPageProps) {
  const { formId } = await params;

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <ReviewFormRouter formId={formId} />
    </div>
  );
}

/**
 * Review detail page component.
 * Requires authentication and displays the review form for a specific form ID.
 */
export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  return (
    <RequireLogin>
      <_ReviewDetailPageContent params={params} />
    </RequireLogin>
  );
}
