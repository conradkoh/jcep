import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormRouter } from '@/modules/review/components/ReviewFormRouter';

interface ReviewDetailPageProps {
  params: Promise<{ formId: Id<'reviewForms'> }>;
}

async function ReviewDetailPageContent({ params }: ReviewDetailPageProps) {
  const { formId } = await params;

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <ReviewFormRouter formId={formId} />
    </div>
  );
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  return (
    <RequireLogin>
      <ReviewDetailPageContent params={params} />
    </RequireLogin>
  );
}
