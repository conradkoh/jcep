'use client';

import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { useReviewFormsByBuddy } from '@/modules/review/hooks/useReviewForm';
import type { ReviewForm } from '@/modules/review/types';
import { getAgeGroupLabel } from '@/modules/review/utils/ageGroupLabels';
import { getSectionCompletionSummary } from '@/modules/review/utils/sectionCompletionHelpers';

/**
 * Content component for the buddy dashboard page.
 * Displays all Junior Commanders assigned to the current user (buddy) with filtering and statistics.
 */
function _BuddyDashboardContent() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { forms, isLoading } = useReviewFormsByBuddy(selectedYear);

  // Filter forms based on status and search
  const filteredForms = useMemo(() => {
    if (!forms) return [];

    let filtered = forms;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((form) => form.status === statusFilter);
    }

    // Filter by search query (JC name)
    if (searchQuery) {
      filtered = filtered.filter((form) =>
        form.juniorCommanderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [forms, statusFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!forms) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, complete: 0 };

    return {
      total: forms.length,
      completed: forms.filter((f) => f.status === 'submitted').length,
      inProgress: forms.filter((f) => f.status === 'in_progress').length,
      notStarted: forms.filter((f) => f.status === 'not_started').length,
      complete: forms.filter((f) => f.status === 'complete').length,
    };
  }, [forms]);

  /**
   * Generates a completion badge for a review form based on section completion status.
   */
  const getCompletionBadge = useCallback((form: ReviewForm) => {
    const { allComplete, completedCount, totalSections } = getSectionCompletionSummary(form);

    if (allComplete) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
      >
        <Circle className="h-3 w-3 mr-1" />
        {completedCount}/{totalSections} Sections
      </Badge>
    );
  }, []);

  /**
   * Generates a status badge for a review form based on its submission status.
   */
  const getStatusBadge = useCallback((status: ReviewForm['status']) => {
    switch (status) {
      case 'not_started':
        return (
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/20">
            Not Started
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
            In Progress
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Complete
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
            Submitted
          </Badge>
        );
    }
  }, []);

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Junior Commanders</h1>
        <p className="text-muted-foreground">
          View and manage review forms for all your assigned JCs
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.notStarted}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search your forms</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="search">Search by JC Name</Label>
            <Input
              id="search"
              placeholder="Enter JC name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="year">Year</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(Number.parseInt(v))}
            >
              <SelectTrigger id="year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-lg font-semibold text-foreground">No Forms Found</p>
            <p className="text-sm text-muted-foreground">
              {forms?.length === 0
                ? 'You have no assigned JCs for this year.'
                : 'No forms match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <Card key={form._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{form.juniorCommanderName}</CardTitle>
                    <CardDescription>{getAgeGroupLabel(form.ageGroup)}</CardDescription>
                  </div>
                  {getStatusBadge(form.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    {getCompletionBadge(form)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(form._creationTime).toLocaleDateString()}</span>
                  </div>
                  {form.submittedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submitted</span>
                      <span>{new Date(form.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link href={`/app/review/${form._id}`}>
                    View Form
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Buddy dashboard page component.
 * Displays all Junior Commanders assigned to the current user (buddy).
 * Requires authentication.
 */
export default function BuddyDashboardPage() {
  return (
    <RequireLogin>
      <_BuddyDashboardContent />
    </RequireLogin>
  );
}
