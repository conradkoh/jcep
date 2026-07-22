'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UseReviewManagementFiltersOptions {
  selectedYear: number;
  selectedRotation: string;
}

export function useReviewManagementFilters({
  selectedYear,
  selectedRotation,
}: UseReviewManagementFiltersOptions) {
  const router = useRouter();

  const pushWithParams = useCallback(
    (year: string, rotation: string) => {
      const params = new URLSearchParams();
      params.set('year', year);
      if (rotation !== 'all') {
        params.set('rotation', rotation);
      }
      router.push(`/app/review-management?${params.toString()}`);
    },
    [router]
  );

  const handleYearChange = useCallback(
    (year: string) => {
      pushWithParams(year, selectedRotation);
    },
    [pushWithParams, selectedRotation]
  );

  const handleRotationChange = useCallback(
    (rotation: string) => {
      pushWithParams(String(selectedYear), rotation);
    },
    [pushWithParams, selectedYear]
  );

  const handleViewCurrentRotation = useCallback(
    (currentYear: number, currentRotation: number) => {
      pushWithParams(String(currentYear), String(currentRotation));
    },
    [pushWithParams]
  );

  return {
    handleYearChange,
    handleRotationChange,
    handleViewCurrentRotation,
  };
}
