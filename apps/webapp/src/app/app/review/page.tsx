'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

/**
 * Props for admin review list content component.
 */
interface _AdminReviewListContentProps {
  /** The selected year to filter review forms */
  selectedYear: number;
}

/**
 * Content component for admin review list page.
 * Displays all review forms for administrators with filtering capabilities.
 */
function _AdminReviewListContent({ selectedYear }: _AdminReviewListContentProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const { forms: allForms, isLoading: isLoadingAllForms } = useAllReviewFormsByYear(
    selectedYear,
    undefined,
    undefined,
    undefined
  );

  const handleYearChange = useCallback(
    (year: string) => {
      router.push(`/app/review?year=${year}`);
    },
    [router]
  );

  if (isLoadingAllForms) {
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
          <h1 className="text-3xl font-bold text-foreground">All Review Forms</h1>
          <p className="text-sm text-muted-foreground">Manage all JCEP rotation review forms</p>
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

      {allForms && <AdminReviewListingTable forms={allForms} onFormDeleted={() => {}} />}
    </div>
  );
}

/**
 * Props for user review list content component.
 */
interface _UserReviewListContentProps {
  /** The selected year to filter review forms */
  selectedYear: number;
}

/**
 * Content component for user review list page.
 * Displays review forms for the current authenticated user.
 */
function _UserReviewListContent({ selectedYear }: _UserReviewListContentProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleYearChange = useCallback(
    (year: string) => {
      router.push(`/app/review?year=${year}`);
    },
    [router]
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Review Forms</h1>
          <p className="text-sm text-muted-foreground">Manage your JCEP rotation review forms</p>
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

      <ReviewFormList year={selectedYear} />
    </div>
  );
}

/**
 * Content component for the review list page.
 * Determines whether to show admin or user view based on authentication state.
 */
function _ReviewListPageContent() {
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));

  // Check if user is system admin
  const authState = useSessionQuery(api.auth.getState, {});
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  // Show loading state while checking auth
  if (authState === undefined) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return isAdmin ? (
    <_AdminReviewListContent selectedYear={selectedYear} />
  ) : (
    <_UserReviewListContent selectedYear={selectedYear} />
  );
}

/**
 * Review list page component.
 * Displays review forms for the current user, with admin view for system administrators.
 * Requires authentication.
 */
export default function ReviewListPage() {
  return (
    <RequireLogin>
      <_ReviewListPageContent />
    </RequireLogin>
  );
}
