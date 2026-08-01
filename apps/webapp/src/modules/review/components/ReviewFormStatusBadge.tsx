'use client';

import type { ReviewFormStatus } from '../types';

import { Badge } from '@/components/ui/badge';

export function ReviewFormStatusBadge({ status }: { status: ReviewFormStatus }) {
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
}
