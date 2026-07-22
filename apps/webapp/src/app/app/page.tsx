'use client';

import { Calendar, ClipboardList, FileText, RotateCcw, Settings, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import {
  APPLICATIONS_MANAGE_PERMISSION,
  REVIEWS_MANAGE_PERMISSION,
  ROTATIONS_MANAGE_PERMISSION,
  SYSTEM_ADMIN_ACCESS_PERMISSION,
  useHasPermission,
} from '@/application/auth';

/**
 * Navigation card component for dashboard links.
 */
interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  external?: boolean;
}

function NavCard({ href, icon, title, description, external }: NavCardProps) {
  const content = (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  const className =
    'group p-6 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-colors block';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

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
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Programme Administration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {canManageApplications && (
                    <NavCard
                      href="/app/applications"
                      icon={<Users className="h-6 w-6 text-primary" />}
                      title="View Applications"
                      description="View all submitted JCEP applications"
                    />
                  )}
                  {canManageRotations && (
                    <NavCard
                      href="/app/rotations"
                      icon={<RotateCcw className="h-6 w-6 text-primary" />}
                      title="Rotation Management"
                      description="Create rotations and assign Junior Commanders"
                    />
                  )}
                  {canManageReviews && (
                    <NavCard
                      href="/app/review-management"
                      icon={<ClipboardList className="h-6 w-6 text-primary" />}
                      title="Review Management"
                      description="Generate and manage review forms for all junior commanders"
                    />
                  )}
                </div>
              </section>
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
