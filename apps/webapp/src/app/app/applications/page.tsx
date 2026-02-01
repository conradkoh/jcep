'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  Pencil,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';

function ApplicationsPageContent() {
  const authState = useAuthState();
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Fetch active applications
  const activeApplications = useSessionQuery(
    api.jcepApplications.listApplications,
    isAdmin ? { includeArchived: false } : 'skip'
  );

  // Fetch archived applications
  const archivedApplications = useSessionQuery(
    api.jcepApplications.listApplications,
    isAdmin ? { includeArchived: true } : 'skip'
  );

  const archiveMutation = useSessionMutation(api.jcepApplications.archiveApplication);
  const unarchiveMutation = useSessionMutation(api.jcepApplications.unarchiveApplication);

  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [archivingId, setArchivingId] = useState<string | null>(null);

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
      day: 'numeric',
      month: 'short',
    });
  };

  const handleArchive = useCallback(
    async (applicationId: Id<'jcepApplications'>) => {
      setArchivingId(applicationId);
      try {
        await archiveMutation({ applicationId });
        toast.success('Application archived');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to archive application');
      } finally {
        setArchivingId(null);
      }
    },
    [archiveMutation]
  );

  const handleUnarchive = useCallback(
    async (applicationId: Id<'jcepApplications'>) => {
      setArchivingId(applicationId);
      try {
        await unarchiveMutation({ applicationId });
        toast.success('Application restored');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to restore application');
      } finally {
        setArchivingId(null);
      }
    },
    [unarchiveMutation]
  );

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

  const isLoading = !activeApplications || !archivedApplications;

  if (isLoading) {
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

  const applications = activeTab === 'active' ? activeApplications : archivedApplications;
  const showArchiveAction = activeTab === 'active';
  const showUnarchiveAction = activeTab === 'archived';

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
              <h2 className="text-xl font-semibold text-foreground">
                {activeTab === 'active' ? 'Active Applications' : 'Archived Applications'}
              </h2>
              <p className="text-muted-foreground text-sm">
                Across {applications.years.length} year{applications.years.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-4xl font-bold text-foreground">{applications.totalCount}</div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Active
              {activeApplications.totalCount > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {activeApplications.totalCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Archived
              {archivedApplications.totalCount > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {archivedApplications.totalCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {applications.years.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {activeTab === 'active'
                      ? 'No active applications.'
                      : 'No archived applications.'}
                  </p>
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
                              <Badge variant="secondary">
                                {yearApplications.length} application
                                {yearApplications.length !== 1 ? 's' : ''}
                              </Badge>
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
                              <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                  <TableHead>Applicant</TableHead>
                                  <TableHead>Choices</TableHead>
                                  <TableHead className="w-[50px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {yearApplications.map((app) => (
                                  <TableRow key={app._id}>
                                    <TableCell>
                                      <div className="space-y-1 max-w-[180px]">
                                        <p className="font-medium truncate">{app.fullName}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                          {app.contactNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(app.submittedAt)}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline">{app.ageGroupChoice1}</Badge>
                                        {app.ageGroupChoice2 && (
                                          <Badge variant="secondary">{app.ageGroupChoice2}</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href={`/app/applications/${app._id}`}>
                                              <Eye className="mr-2 h-4 w-4" />
                                              View
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href={`/app/applications/${app._id}/edit`}>
                                              <Pencil className="mr-2 h-4 w-4" />
                                              Edit
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {showArchiveAction && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleArchive(app._id as Id<'jcepApplications'>)
                                              }
                                              disabled={archivingId === app._id}
                                              className="cursor-pointer"
                                            >
                                              <Archive className="mr-2 h-4 w-4" />
                                              {archivingId === app._id ? 'Archiving...' : 'Archive'}
                                            </DropdownMenuItem>
                                          )}
                                          {showUnarchiveAction && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleUnarchive(app._id as Id<'jcepApplications'>)
                                              }
                                              disabled={archivingId === app._id}
                                              className="cursor-pointer"
                                            >
                                              <ArchiveRestore className="mr-2 h-4 w-4" />
                                              {archivingId === app._id ? 'Restoring...' : 'Restore'}
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
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
          </TabsContent>
        </Tabs>
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
