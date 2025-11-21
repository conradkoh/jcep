'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAllReviewFormsByYear } from '../../hooks/useReviewForm';
import type { AgeGroup, ReviewFormStatus } from '../../types';
import { AdminReviewExport } from './AdminReviewExport';
import { AdminReviewFilters } from './AdminReviewFilters';
import { AdminReviewTable } from './AdminReviewTable';

export function AdminReviewDashboard() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [quarterFilter, setQuarterFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReviewFormStatus | 'all'>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<AgeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch forms with backend filters
  const { forms, isLoading } = useAllReviewFormsByYear(
    year,
    quarterFilter === 'all' ? undefined : quarterFilter,
    statusFilter === 'all' ? undefined : statusFilter,
    ageGroupFilter === 'all' ? undefined : ageGroupFilter
  );

  // Apply client-side search filter
  const filteredForms = useMemo(() => {
    if (!forms) return [];
    if (!searchQuery) return forms;

    const query = searchQuery.toLowerCase();
    return forms.filter(
      (form) =>
        form.juniorCommanderName.toLowerCase().includes(query) ||
        form.buddyName.toLowerCase().includes(query)
    );
  }, [forms, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredForms)
      return { total: 0, notStarted: 0, inProgress: 0, complete: 0, submitted: 0 };

    return {
      total: filteredForms.length,
      notStarted: filteredForms.filter((f) => f.status === 'not_started').length,
      inProgress: filteredForms.filter((f) => f.status === 'in_progress').length,
      complete: filteredForms.filter((f) => f.status === 'complete').length,
      submitted: filteredForms.filter((f) => f.status === 'submitted').length,
    };
  }, [filteredForms]);

  const handleClearFilters = () => {
    setQuarterFilter('all');
    setStatusFilter('all');
    setAgeGroupFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Forms Dashboard</h1>
          <p className="text-sm text-muted-foreground">View and manage all JCEP review forms</p>
        </div>
        <AdminReviewExport forms={filteredForms} year={year} />
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.notStarted}</div>
            <p className="text-sm text-muted-foreground">Not Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.complete}</div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.submitted}</div>
            <p className="text-sm text-muted-foreground">Submitted</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <AdminReviewFilters
        year={year}
        quarter={quarterFilter}
        status={statusFilter}
        ageGroup={ageGroupFilter}
        searchQuery={searchQuery}
        onYearChange={setYear}
        onQuarterChange={setQuarterFilter}
        onStatusChange={setStatusFilter}
        onAgeGroupChange={setAgeGroupFilter}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading forms...</p>
        </div>
      ) : (
        <AdminReviewTable forms={filteredForms} onFormDeleted={() => {}} />
      )}
    </div>
  );
}
