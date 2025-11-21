'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { AdminReviewListingTable } from '@/modules/review/components/admin/AdminReviewListingTable';
import { ReviewFormList } from '@/modules/review/components/ReviewFormList';
import { useAllReviewFormsByYear } from '@/modules/review/hooks/useReviewForm';

function ReviewListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));

  // Check if user is system admin
  const authState = useSessionQuery(api.auth.getState, {});
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  // Get all forms for admin, or user's forms for non-admin
  const { forms: allForms, isLoading: isLoadingAllForms } = useAllReviewFormsByYear(selectedYear);

  const handleYearChange = (year: string) => {
    router.push(`/app/review?year=${year}`);
  };

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Show loading state
  if (authState === undefined || (isAdmin && isLoadingAllForms)) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? 'All Review Forms' : 'My Review Forms'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Manage all JCEP rotation review forms'
              : 'Manage your JCEP rotation review forms'}
          </p>
        </div>
        <Button asChild aria-label="Create a new review form">
          <Link href="/app/review/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Label htmlFor="year-filter" className="text-sm font-medium text-foreground">
          Showing forms for
        </Label>
        <Select value={String(selectedYear)} onValueChange={handleYearChange}>
          <SelectTrigger id="year-filter" className="w-full sm:w-[220px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && allForms ? (
        <AdminReviewListingTable forms={allForms} onFormDeleted={() => {}} />
      ) : (
        <ReviewFormList year={selectedYear} />
      )}
    </div>
  );
}

export default function ReviewListPage() {
  return (
    <RequireLogin>
      <ReviewListPageContent />
    </RequireLogin>
  );
}
