'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormList } from '@/modules/review/components/ReviewFormList';
import { ReviewRotationSelect } from '@/modules/review/components/ReviewRotationSelect';
import { ReviewYearSelect } from '@/modules/review/components/ReviewYearSelect';

function ReviewListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));
  const selectedRotation = searchParams.get('rotation') || 'all';
  const rotationNumber =
    selectedRotation === 'all' ? undefined : Number.parseInt(selectedRotation, 10);

  const pushWithParams = useCallback(
    (params: { year: string; rotation: string }) => {
      const searchParams = new URLSearchParams();
      searchParams.set('year', params.year);
      if (params.rotation !== 'all') {
        searchParams.set('rotation', params.rotation);
      }
      router.push(`/app/review?${searchParams.toString()}`);
    },
    [router]
  );

  const handleYearChange = useCallback(
    (year: string) => pushWithParams({ year, rotation: selectedRotation }),
    [pushWithParams, selectedRotation]
  );

  const handleRotationChange = useCallback(
    (rotation: string) => pushWithParams({ year: String(selectedYear), rotation }),
    [pushWithParams, selectedYear]
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <ReviewYearSelect
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          label="Year"
        />
        <ReviewRotationSelect
          selectedRotation={selectedRotation}
          onRotationChange={handleRotationChange}
        />
      </div>

      <ReviewFormList
        year={selectedYear}
        rotationNumber={rotationNumber}
        selectedRotation={selectedRotation}
      />
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
