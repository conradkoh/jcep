'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewYearSelectProps {
  selectedYear: number;
  onYearChange: (year: string) => void;
  id?: string;
  label?: string;
  triggerClassName?: string;
  yearCount?: number;
  yearOptions?: number[];
}

/**
 * Year dropdown shared by personal and admin review form listings.
 */
export function ReviewYearSelect({
  selectedYear,
  onYearChange,
  id = 'year-filter',
  label = 'Showing forms for',
  triggerClassName = 'w-full sm:w-[220px]',
  yearCount = 6,
  yearOptions,
}: ReviewYearSelectProps) {
  const currentYear = new Date().getFullYear();
  const yearOptionsList =
    yearOptions && yearOptions.length > 0
      ? yearOptions
      : Array.from({ length: yearCount }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Select value={String(selectedYear)} onValueChange={(v) => v !== null && onYearChange(v)}>
        <SelectTrigger id={id} className={triggerClassName}>
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptionsList.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
