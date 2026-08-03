'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROTATION_OPTIONS = [
  { value: 'all', label: 'All Rotations' },
  { value: '1', label: 'Rotation 1' },
  { value: '2', label: 'Rotation 2' },
  { value: '3', label: 'Rotation 3' },
  { value: '4', label: 'Rotation 4' },
] as const;

interface ReviewRotationSelectProps {
  selectedRotation: string;
  onRotationChange: (rotation: string) => void;
  id?: string;
  label?: string;
  triggerClassName?: string;
}

export function ReviewRotationSelect({
  selectedRotation,
  onRotationChange,
  id = 'rotation-filter',
  label = 'Rotation',
  triggerClassName = 'w-full sm:w-[220px]',
}: ReviewRotationSelectProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Select value={selectedRotation} onValueChange={(v) => v !== null && onRotationChange(v)}>
        <SelectTrigger id={id} className={triggerClassName}>
          <SelectValue placeholder="Select rotation" />
        </SelectTrigger>
        <SelectContent>
          {ROTATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
