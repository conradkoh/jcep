'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ReviewFormList } from '@/modules/review/components/ReviewFormList';

function ReviewListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number.parseInt(searchParams.get('year') || String(currentYear));

  const handleYearChange = (year: string) => {
    router.push(`/app/review?year=${year}`);
  };

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Forms</h1>
          <p className="text-sm text-muted-foreground">Manage JCEP rotation review forms</p>
        </div>
        <Button asChild>
          <Link href="/app/review/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <Label htmlFor="year-filter" className="text-sm font-medium text-foreground">
          Filter by Year:
        </Label>
        <Select value={String(selectedYear)} onValueChange={handleYearChange}>
          <SelectTrigger id="year-filter" className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ReviewFormList year={selectedYear} />
    </div>
  );
}

export default function ReviewListPage() {
  return (
    <RequireLogin>
      <ReviewListPageContent />
    </RequireLogin>
  );
}
