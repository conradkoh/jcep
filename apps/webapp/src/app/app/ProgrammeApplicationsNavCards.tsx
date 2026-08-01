import { Users } from 'lucide-react';

import { NavCard } from './DashboardNavCard';

export function ProgrammeApplicationsNavCards() {
  return (
    <>
      <NavCard
        href="/app/applications"
        icon={<Users className="h-6 w-6 text-primary" />}
        title="View Applications"
        description="View all submitted JCEP applications"
      />
      <NavCard
        href="/app/programme-candidates"
        icon={<Users className="h-6 w-6 text-primary" />}
        title="Programme Candidates"
        description="View possible candidates by birth-year batch"
      />
    </>
  );
}
