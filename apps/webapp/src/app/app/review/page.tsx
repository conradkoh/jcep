'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormList } from '@/modules/review/components/ReviewFormList';
import { ReviewYearSelect } from '@/modules/review/components/ReviewYearSelect';

function ReviewListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));

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
          <p className="text-sm text-muted-foreground">View and manage your JCEP review forms</p>
        </div>
        <Button asChild aria-label="Create a new review form">
          <Link href="/app/review/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Link>
        </Button>
      </div>

      <Separator />

      <ReviewYearSelect selectedYear={selectedYear} onYearChange={handleYearChange} />

      <ReviewFormList year={selectedYear} />
    </div>
  );
}

/**
 * Review list page for the current user's review forms.
 * Requires authentication.
 */
export default function ReviewListPage() {
  return (
    <RequireLogin>
      <ReviewListPageContent />
    </RequireLogin>
  );
}
