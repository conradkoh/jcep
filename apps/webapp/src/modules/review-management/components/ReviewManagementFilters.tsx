'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReviewYearSelect } from '@/modules/review/components/ReviewYearSelect';

const ROTATION_OPTIONS = [
  { value: 'all', label: 'All Rotations' },
  { value: '1', label: 'Rotation 1' },
  { value: '2', label: 'Rotation 2' },
  { value: '3', label: 'Rotation 3' },
  { value: '4', label: 'Rotation 4' },
] as const;

interface ReviewManagementFiltersProps {
  selectedYear: number;
  selectedRotation: string;
  onYearChange: (year: string) => void;
  onRotationChange: (rotation: string) => void;
}

export function ReviewManagementFilters({
  selectedYear,
  selectedRotation,
  onYearChange,
  onRotationChange,
}: ReviewManagementFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
      <ReviewYearSelect
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        label="Year"
        triggerClassName="w-[120px]"
      />
      <div className="flex items-center gap-2">
        <Label
          htmlFor="rotation-filter"
          className="text-sm font-medium text-foreground whitespace-nowrap"
        >
          Quarter
        </Label>
        <Select value={selectedRotation} onValueChange={onRotationChange}>
          <SelectTrigger id="rotation-filter" className="w-[160px]">
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
    </div>
  );
}
