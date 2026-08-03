'use client';

import { RotateCcw, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ROTATIONS_MANAGE_PERMISSION, useHasPermission } from '@/application/auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { RotationCreateForm } from '@/modules/rotations/components/RotationCreateForm';
import { RotationList } from '@/modules/rotations/components/RotationList';
import { useListRotations } from '@/modules/rotations/hooks/useRotations';

function RotationsPageContent() {
  const router = useRouter();
  const isAdmin = useHasPermission(ROTATIONS_MANAGE_PERMISSION);

  const { rotations, isLoading } = useListRotations(isAdmin);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">
                Only programme administrators can manage rotations.
              </p>
              <Link href="/app" className={buttonVariants({ variant: 'outline' })}>
                Back to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading rotations...</p>
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
            <div className="flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Rotation Management</h1>
                <p className="text-muted-foreground mt-1">
                  Create rotations and assign Junior Commanders
                </p>
              </div>
            </div>
            <Link href="/app">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <RotationCreateForm
          onCreated={(rotationId) => {
            router.push(`/app/rotations/${rotationId}`);
          }}
        />

        {rotations && <RotationList rotations={rotations} />}
      </div>
    </div>
  );
}

export default function RotationsPage() {
  return (
    <RequireLogin>
      <RotationsPageContent />
    </RequireLogin>
  );
}
