'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AgeGroup, ReviewFormStatus } from '../../types';
import { getRotationQuarterOptionsShort } from '../../utils/rotationUtils';

interface AdminReviewFiltersProps {
  year: number;
  quarter: number | 'all';
  status: ReviewFormStatus | 'all';
  ageGroup: AgeGroup | 'all';
  searchQuery: string;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: number | 'all') => void;
  onStatusChange: (status: ReviewFormStatus | 'all') => void;
  onAgeGroupChange: (ageGroup: AgeGroup | 'all') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function AdminReviewFilters({
  year,
  quarter,
  status,
  ageGroup,
  searchQuery,
  onYearChange,
  onQuarterChange,
  onStatusChange,
  onAgeGroupChange,
  onSearchChange,
  onClearFilters,
}: AdminReviewFiltersProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const hasActiveFilters =
    quarter !== 'all' || status !== 'all' || ageGroup !== 'all' || searchQuery !== '';

  return (
    <section
      aria-label="Filter review forms"
      className="space-y-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Clear all filters"
          >
            <X className="mr-1 h-3 w-3" aria-hidden />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label htmlFor="year-filter" className="text-sm font-medium text-foreground">
            Year
          </Label>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number.parseInt(v, 10))}>
            <SelectTrigger id="year-filter" className="mt-1">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quarter-filter" className="text-sm font-medium text-foreground">
            Quarter
          </Label>
          <Select
            value={String(quarter)}
            onValueChange={(v) => onQuarterChange(v === 'all' ? 'all' : Number.parseInt(v, 10))}
          >
            <SelectTrigger id="quarter-filter" className="mt-1">
              <SelectValue placeholder="All quarters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All quarters</SelectItem>
              {getRotationQuarterOptionsShort().map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status-filter" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="age-group-filter" className="text-sm font-medium text-foreground">
            Age group
          </Label>
          <Select value={ageGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger id="age-group-filter" className="mt-1">
              <SelectValue placeholder="All age groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All age groups</SelectItem>
              <SelectItem value="RK">Ranger Kids</SelectItem>
              <SelectItem value="DR">Discovery Rangers</SelectItem>
              <SelectItem value="AR">Adventure Rangers</SelectItem>
              <SelectItem value="ER">Expedition Rangers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="search-filter" className="text-sm font-medium text-foreground">
            Search by name
          </Label>
          <Input
            id="search-filter"
            type="search"
            placeholder="Buddy or JC name"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </section>
  );
}
