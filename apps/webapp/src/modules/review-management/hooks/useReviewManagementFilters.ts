'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UseReviewManagementFiltersOptions {
  selectedYear: number;
  selectedRotation: string;
  selectedRotationId: Id<'rotations'> | null;
}

export function useReviewManagementFilters({
  selectedYear,
  selectedRotation,
  selectedRotationId,
}: UseReviewManagementFiltersOptions) {
  const router = useRouter();

  const pushWithParams = useCallback(
    (params: { year: string; rotation: string; rotationId: Id<'rotations'> | null }) => {
      const searchParams = new URLSearchParams();
      searchParams.set('year', params.year);
      if (params.rotation !== 'all') {
        searchParams.set('rotation', params.rotation);
      }
      if (params.rotationId) {
        searchParams.set('rotationId', params.rotationId);
      }
      router.push(`/app/review-management?${searchParams.toString()}`);
    },
    [router]
  );

  const handleYearChange = useCallback(
    (year: string) => {
      pushWithParams({ year, rotation: selectedRotation, rotationId: selectedRotationId });
    },
    [pushWithParams, selectedRotation, selectedRotationId]
  );

  const handleRotationChange = useCallback(
    (rotation: string) => {
      pushWithParams({
        year: String(selectedYear),
        rotation,
        rotationId: selectedRotationId,
      });
    },
    [pushWithParams, selectedYear, selectedRotationId]
  );

  const handleRotationIdChange = useCallback(
    (rotationId: Id<'rotations'> | null, sync?: { year: number; quarter: number }) => {
      pushWithParams({
        year: sync ? String(sync.year) : String(selectedYear),
        rotation: sync ? String(sync.quarter) : selectedRotation,
        rotationId,
      });
    },
    [pushWithParams, selectedYear, selectedRotation]
  );

  const handleViewCurrentRotation = useCallback(
    (currentYear: number, currentRotation: number) => {
      pushWithParams({
        year: String(currentYear),
        rotation: String(currentRotation),
        rotationId: null,
      });
    },
    [pushWithParams]
  );

  return {
    handleYearChange,
    handleRotationChange,
    handleRotationIdChange,
    handleViewCurrentRotation,
  };
}
