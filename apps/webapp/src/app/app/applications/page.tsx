'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';

function ApplicationsPageContent() {
  const authState = useAuthState();
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  const applications = useSessionQuery(
    api.jcepApplications.listApplications,
    isAdmin ? {} : 'skip'
  );

  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Non-admin users see access denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">
                Only system administrators can view JCEP applications.
              </p>
              <Button asChild variant="outline">
                <Link href="/app">Back to Dashboard</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!applications) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">JCEP Applications</h1>
              <p className="text-muted-foreground mt-1">View all submitted JCEP applications</p>
            </div>
            <Link href="/app">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Total Applications</h2>
              <p className="text-muted-foreground text-sm">
                Across {applications.years.length} year{applications.years.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-4xl font-bold text-foreground">{applications.totalCount}</div>
          </div>
        </Card>

        {applications.years.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">No applications have been submitted yet.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.years.map((year) => {
              const yearApplications = applications.groupedByYear[year];
              const isExpanded = expandedYears.has(year);

              return (
                <Collapsible key={year} open={isExpanded} onOpenChange={() => toggleYear(year)}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-semibold text-foreground">{year}</h3>
                          <Badge variant="secondary">{yearApplications.length} applications</Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Full Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Choice 1</TableHead>
                              <TableHead>Choice 2</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {yearApplications.map((app) => (
                              <TableRow key={app._id}>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(app.submittedAt)}
                                </TableCell>
                                <TableCell className="font-medium">{app.fullName}</TableCell>
                                <TableCell className="text-sm">{app.contactNumber}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Badge variant="outline">{app.ageGroupChoice1}</Badge>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {app.reasonForChoice1}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {app.ageGroupChoice2 ? (
                                    <div className="space-y-1">
                                      <Badge variant="outline">{app.ageGroupChoice2}</Badge>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {app.reasonForChoice2}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <RequireLogin>
      <ApplicationsPageContent />
    </RequireLogin>
  );
}
