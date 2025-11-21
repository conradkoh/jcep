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

interface AdminReviewFiltersProps {
  year: number;
  status: ReviewFormStatus | 'all';
  ageGroup: AgeGroup | 'all';
  searchQuery: string;
  onYearChange: (year: number) => void;
  onStatusChange: (status: ReviewFormStatus | 'all') => void;
  onAgeGroupChange: (ageGroup: AgeGroup | 'all') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function AdminReviewFilters({
  year,
  status,
  ageGroup,
  searchQuery,
  onYearChange,
  onStatusChange,
  onAgeGroupChange,
  onSearchChange,
  onClearFilters,
}: AdminReviewFiltersProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const hasActiveFilters = status !== 'all' || ageGroup !== 'all' || searchQuery !== '';

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <Label htmlFor="status-filter" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
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
