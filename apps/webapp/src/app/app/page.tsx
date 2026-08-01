'use client';

import { Calendar, ClipboardList, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

import { NavCard } from './DashboardNavCard';
import { ProgrammeAdministrationSection } from './ProgrammeAdministrationSection';

import {
  APPLICATIONS_MANAGE_PERMISSION,
  REVIEWS_MANAGE_PERMISSION,
  ROTATIONS_MANAGE_PERMISSION,
  SYSTEM_ADMIN_ACCESS_PERMISSION,
  useHasPermission,
} from '@/application/auth';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';

/**
 * Displays the main application dashboard with navigation links.
 */
export default function AppPage() {
  const authState = useAuthState();
  const isAuthenticated = authState?.state === 'authenticated';
  const canManageReviews = useHasPermission(REVIEWS_MANAGE_PERMISSION);
  const canManageRotations = useHasPermission(ROTATIONS_MANAGE_PERMISSION);
  const canManageApplications = useHasPermission(APPLICATIONS_MANAGE_PERMISSION);
  const hasSystemAdminAccess = useHasPermission(SYSTEM_ADMIN_ACCESS_PERMISSION);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Welcome to JCEP</h1>

            {isAuthenticated && (
              <Link href="/app/profile">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-8">
            {(canManageReviews || canManageRotations || canManageApplications) && (
              <ProgrammeAdministrationSection
                canManageApplications={canManageApplications}
                canManageRotations={canManageRotations}
                canManageReviews={canManageReviews}
              />
            )}

            {hasSystemAdminAccess && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  System Administration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NavCard
                    href="/app/admin"
                    icon={<Settings className="h-6 w-6 text-primary" />}
                    title="System Admin"
                    description="System configuration and administration"
                  />
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NavCard
                  href="/app/review"
                  icon={<ClipboardList className="h-6 w-6 text-primary" />}
                  title="My Review Forms"
                  description="View and manage your review forms"
                />
                <NavCard
                  href="/apply"
                  icon={<FileText className="h-6 w-6 text-primary" />}
                  title="Apply to JCEP"
                  description="Submit an application to join the programme"
                />
                <NavCard
                  href="https://docs.google.com/spreadsheets/d/1oCii9CYZiTNhEi9IEkRD_40eTTzl4EAuyJPR9aBnZKI/edit?usp=drivesdk"
                  icon={<Calendar className="h-6 w-6 text-primary" />}
                  title="JCEP 2026 Schedule"
                  description="View the programme schedule and important dates"
                  external
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
