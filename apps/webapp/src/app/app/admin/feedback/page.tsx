'use client';

import { MessageSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListFeedbackSubmissions } from '@/modules/feedback/hooks/useFeedback';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const { submissions, isLoading } = useListFeedbackSubmissions(true);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Feedback Submissions</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          View feedback submitted through the standalone feedback form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Submissions
          </CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading submissions...'
              : `${submissions?.length ?? 0} submission${submissions?.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : submissions && submissions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Submitted</TableHead>
                    <TableHead className="w-48">Respondent</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                      <TableCell>
                        {submission.respondentName ? (
                          <span className="text-sm font-medium text-foreground">
                            {submission.respondentName}
                          </span>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap text-sm text-foreground">
                        {submission.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No feedback submissions yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
