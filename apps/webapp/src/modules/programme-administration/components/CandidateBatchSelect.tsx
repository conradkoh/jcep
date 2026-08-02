'use client';

import { ChevronDown } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CandidateBatchSelectProps {
  batches: number[];
  selectedBatches: number[];
  onBatchesChange: (years: number[]) => void;
}

function formatTriggerLabel(selectedBatches: number[]): string {
  if (selectedBatches.length === 0) return 'Select batch years';
  if (selectedBatches.length === 1) return String(selectedBatches[0]);
  if (selectedBatches.length <= 3) return selectedBatches.join(', ');
  return `${selectedBatches.length} years selected`;
}

export function CandidateBatchSelect({
  batches,
  selectedBatches,
  onBatchesChange,
}: CandidateBatchSelectProps) {
  const toggleYear = (year: number) => {
    if (selectedBatches.includes(year)) {
      onBatchesChange(selectedBatches.filter((y) => y !== year));
    } else {
      onBatchesChange([...selectedBatches, year].sort((a, b) => b - a));
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <Label htmlFor="batch-filter" className="text-sm font-medium text-foreground">
        JCEP Batch Years
      </Label>
      <Popover>
        <PopoverTrigger
          id="batch-filter"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-between sm:w-[220px]'
          )}
        >
          {formatTriggerLabel(selectedBatches)}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-2" align="start">
          <div className="flex flex-col gap-1">
            {batches.map((year) => (
              <label
                key={year}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
              >
                <Checkbox
                  checked={selectedBatches.includes(year)}
                  onCheckedChange={() => toggleYear(year)}
                />
                <span className="text-sm">{year}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
