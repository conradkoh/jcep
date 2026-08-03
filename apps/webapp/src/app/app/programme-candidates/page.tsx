'use client';

import Link from 'next/link';

import { APPLICATIONS_MANAGE_PERMISSION, RequirePermission } from '@/application/auth';
import { buttonVariants } from '@/components/ui/button';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { ProgrammeAdministrationDashboard } from '@/modules/programme-administration/components/ProgrammeAdministrationDashboard';

function ProgrammeAdministrationPageContent() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-end">
        <Link href="/app" className={buttonVariants({ variant: 'outline' })}>
          Back to Dashboard
        </Link>
      </div>
      <ProgrammeAdministrationDashboard />
    </div>
  );
}

export default function ProgrammeAdministrationPage() {
  return (
    <RequireLogin>
      <RequirePermission permission={APPLICATIONS_MANAGE_PERMISSION}>
        <ProgrammeAdministrationPageContent />
      </RequirePermission>
    </RequireLogin>
  );
}
