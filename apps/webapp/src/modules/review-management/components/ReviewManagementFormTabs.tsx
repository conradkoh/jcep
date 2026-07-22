'use client';

import { Archive } from 'lucide-react';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminReviewListingTable } from '@/modules/review/components/admin/AdminReviewListingTable';
import type { ReviewForm } from '@/modules/review/types';

interface ReviewManagementFormTabsProps {
  activeForms: ReviewForm[] | undefined;
  archivedForms: ReviewForm[] | undefined;
}

/**
 * Active and archived review form tabs for admin review management.
 */
// fallow-ignore-next-line complexity
export function ReviewManagementFormTabs({
  activeForms,
  archivedForms,
}: ReviewManagementFormTabsProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
      <TabsList>
        <TabsTrigger value="active">
          Active
          {activeForms && activeForms.length > 0 && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {activeForms.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="archived">
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          Archived
          {archivedForms && archivedForms.length > 0 && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {archivedForms.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-4">
        {activeForms && (
          <AdminReviewListingTable forms={activeForms} onFormDeleted={() => {}} showArchiveAction />
        )}
      </TabsContent>
      <TabsContent value="archived" className="mt-4">
        {archivedForms && (
          <AdminReviewListingTable
            forms={archivedForms}
            onFormDeleted={() => {}}
            showUnarchiveAction
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
