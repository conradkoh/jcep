'use client';

import { AdminReviewDashboard } from '@/modules/review/components/admin/AdminReviewDashboard';

/**
 * Admin reviews page component.
 * Access control is handled by the parent `/app/admin` layout.
 */
export default function AdminReviewsPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <AdminReviewDashboard />
    </div>
  );
}
