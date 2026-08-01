import { ClipboardList, RotateCcw } from 'lucide-react';

import { NavCard } from './DashboardNavCard';
import { ProgrammeApplicationsNavCards } from './ProgrammeApplicationsNavCards';

interface ProgrammeAdministrationSectionProps {
  canManageApplications: boolean;
  canManageRotations: boolean;
  canManageReviews: boolean;
}

export function ProgrammeAdministrationSection({
  canManageApplications,
  canManageRotations,
  canManageReviews,
}: ProgrammeAdministrationSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Programme Administration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canManageApplications && <ProgrammeApplicationsNavCards />}
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
  );
}
