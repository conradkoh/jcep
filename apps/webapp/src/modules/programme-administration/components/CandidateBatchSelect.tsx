'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CandidateBatchSelectProps {
  batches: number[];
  selectedBatch: number;
  onBatchChange: (year: string) => void;
}

export function CandidateBatchSelect({
  batches,
  selectedBatch,
  onBatchChange,
}: CandidateBatchSelectProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Label htmlFor="batch-filter" className="text-sm font-medium text-foreground">
        Batch (birth year)
      </Label>
      <Select value={String(selectedBatch)} onValueChange={onBatchChange}>
        <SelectTrigger id="batch-filter" className="w-full sm:w-[220px]">
          <SelectValue placeholder="Select batch" />
        </SelectTrigger>
        <SelectContent>
          {batches.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
