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

function AdminReviewListContent({ selectedYear }: { selectedYear: number }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Get all forms for admin
  const { forms: allForms, isLoading: isLoadingAllForms } = useAllReviewFormsByYear(
    selectedYear,
    undefined, // quarter
    undefined, // status
    undefined // ageGroup
  );

  const handleYearChange = (year: string) => {
    router.push(`/app/review?year=${year}`);
  };

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

function UserReviewListContent({ selectedYear }: { selectedYear: number }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleYearChange = (year: string) => {
    router.push(`/app/review?year=${year}`);
  };

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

function ReviewListPageContent() {
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

  // Render different components based on admin status to avoid calling admin hooks for non-admins
  return isAdmin ? (
    <AdminReviewListContent selectedYear={selectedYear} />
  ) : (
    <UserReviewListContent selectedYear={selectedYear} />
  );
}

export default function ReviewListPage() {
  return (
    <RequireLogin>
      <ReviewListPageContent />
    </RequireLogin>
  );
}
