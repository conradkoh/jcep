'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { REVIEWS_MANAGE_PERMISSION, RequirePermission } from '@/application/auth';
import { Button } from '@/components/ui/button';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewManagementDashboard } from '@/modules/review-management/components/ReviewManagementDashboard';

function ReviewManagementPageContent() {
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));
  const selectedRotation = searchParams.get('rotation') || 'all';
  const rotationIdParam = searchParams.get('rotationId');
  const selectedRotationId = rotationIdParam ? (rotationIdParam as Id<'rotations'>) : null;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/app">Back to Dashboard</Link>
        </Button>
      </div>
      <ReviewManagementDashboard
        selectedYear={selectedYear}
        selectedRotation={selectedRotation}
        selectedRotationId={selectedRotationId}
      />
    </div>
  );
}

/**
 * Admin page for managing all JCEP review forms.
 * Requires system administrator access.
 */
export default function ReviewManagementPage() {
  return (
    <RequireLogin>
      <RequirePermission permission={REVIEWS_MANAGE_PERMISSION}>
        <ReviewManagementPageContent />
      </RequirePermission>
    </RequireLogin>
  );
}
