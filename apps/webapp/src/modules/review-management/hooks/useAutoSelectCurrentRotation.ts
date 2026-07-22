'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect, useRef } from 'react';

import type { Rotation } from '@/modules/rotations/types';

interface UseAutoSelectCurrentRotationOptions {
  selectedRotationId: Id<'rotations'> | null;
  rotations: Rotation[] | undefined;
  isLoading: boolean;
  currentYear: number;
  currentQuarter: number;
  onSelect: (rotationId: Id<'rotations'>, year: number, quarter: number) => void;
}

/**
 * Auto-selects the rotation matching the current year/quarter on first visit.
 */
// fallow-ignore-next-line complexity
export function useAutoSelectCurrentRotation({
  selectedRotationId,
  rotations,
  isLoading,
  currentYear,
  currentQuarter,
  onSelect,
}: UseAutoSelectCurrentRotationOptions) {
  const hasAutoSelected = useRef(false);

  // fallow-ignore-next-line complexity
  useEffect(() => {
    if (hasAutoSelected.current || selectedRotationId || isLoading || !rotations?.length) {
      return;
    }

    const currentRotation = rotations.find(
      (r) => r.rotationYear === currentYear && r.rotationQuarter === currentQuarter
    );
    if (currentRotation) {
      hasAutoSelected.current = true;
      onSelect(currentRotation._id, currentRotation.rotationYear, currentRotation.rotationQuarter);
    }
  }, [selectedRotationId, isLoading, rotations, currentYear, currentQuarter, onSelect]);
}
