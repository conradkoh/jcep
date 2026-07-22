import { redirect } from 'next/navigation';

/**
 * Legacy admin reviews route — redirects to Review Management.
 */
export default function AdminReviewsRedirectPage() {
  redirect('/app/review-management');
}
