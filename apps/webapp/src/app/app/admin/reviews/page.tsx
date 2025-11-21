'use client';

import { AdminGuard } from '@/modules/admin/AdminGuard';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { AdminReviewDashboard } from '@/modules/review/components/admin/AdminReviewDashboard';

/**
 * Content component for the admin reviews page.
 * Displays the admin review dashboard with proper container styling.
 */
function _AdminReviewsPageContent() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <AdminReviewDashboard />
    </div>
  );
}

/**
 * Admin reviews page component.
 * Requires authentication and admin access level.
 */
export default function AdminReviewsPage() {
  return (
    <RequireLogin>
      <AdminGuard>
        <_AdminReviewsPageContent />
      </AdminGuard>
    </RequireLogin>
  );
}
