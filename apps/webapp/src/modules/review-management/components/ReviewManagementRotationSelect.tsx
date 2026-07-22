'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';
import { useListRotations } from '@/modules/rotations/hooks/useRotations';
import type { Rotation } from '@/modules/rotations/types';

interface ReviewManagementRotationSelectProps {
  selectedRotationId: Id<'rotations'> | null;
  onRotationChange: (rotationId: Id<'rotations'> | null) => void;
}

function getRotationLabel(rotation: Rotation): string {
  return rotation.label || formatRotationLabel(rotation.rotationYear, rotation.rotationQuarter);
}

export function ReviewManagementRotationSelect({
  selectedRotationId,
  onRotationChange,
}: ReviewManagementRotationSelectProps) {
  const { rotations, isLoading } = useListRotations(true);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Label htmlFor="rotation-select" className="text-sm font-medium text-foreground">
        Rotation to manage
      </Label>
      <Select
        value={selectedRotationId ?? 'none'}
        onValueChange={(value) =>
          onRotationChange(value === 'none' ? null : (value as Id<'rotations'>))
        }
        disabled={isLoading}
      >
        <SelectTrigger id="rotation-select" className="w-full sm:w-[320px]">
          <SelectValue placeholder={isLoading ? 'Loading rotations...' : 'Select a rotation'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Select a rotation —</SelectItem>
          {(rotations ?? []).map((rotation) => (
            <SelectItem key={rotation._id} value={rotation._id}>
              {getRotationLabel(rotation)} ({rotation.participantCount ?? 0} JCs)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
