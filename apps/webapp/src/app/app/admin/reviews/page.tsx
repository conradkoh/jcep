'use client';

import { AdminGuard } from '@/modules/admin/AdminGuard';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { AdminReviewDashboard } from '@/modules/review/components/admin/AdminReviewDashboard';

function AdminReviewsPageContent() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <AdminReviewDashboard />
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <RequireLogin>
      <AdminGuard>
        <AdminReviewsPageContent />
      </AdminGuard>
    </RequireLogin>
  );
}
