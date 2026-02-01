'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { ArrowLeft, Calendar, Phone, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';

const AGE_GROUP_LABELS: Record<string, string> = {
  RK: 'Rangers Kids',
  DR: 'Discovery Rangers',
  AR: 'Adventure Rangers',
  ER: 'Expedition Rangers',
};

function ApplicationViewContent({ applicationId }: { applicationId: Id<'jcepApplications'> }) {
  const authState = useAuthState();
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  const application = useSessionQuery(
    api.jcepApplications.getApplication,
    isAdmin ? { applicationId } : 'skip'
  );

  // Non-admin users see access denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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

  if (application === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading application...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (application === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Application not found.</p>
              <Button asChild variant="outline">
                <Link href="/app/applications">Back to Applications</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/app/applications">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Application Details</h1>
                <p className="text-muted-foreground mt-1">
                  Submitted on {formatDate(application.submittedAt)}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/app/applications/${applicationId}/edit`}>Edit Application</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          {application.archivedAt && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This application was archived on {formatDate(application.archivedAt)}
              </p>
            </Card>
          )}

          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h2>
            <dl className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">{application.fullName}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </dt>
                <dd className="font-medium text-foreground">{application.contactNumber}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submission Year
                </dt>
                <dd className="font-medium text-foreground">{application.submissionYear}</dd>
              </div>
            </dl>
          </Card>

          {/* Serving Preferences */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Serving Preferences</h2>

            <div className="space-y-6">
              {/* Choice 1 */}
              <div className="p-4 bg-accent/40 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{application.ageGroupChoice1}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {AGE_GROUP_LABELS[application.ageGroupChoice1]}
                  </span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Choice 1 - Reason</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.reasonForChoice1}
                </p>
              </div>

              {/* Choice 2 */}
              {application.ageGroupChoice2 && (
                <div className="p-4 bg-accent/40 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{application.ageGroupChoice2}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {AGE_GROUP_LABELS[application.ageGroupChoice2]}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Choice 2 - Reason</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {application.reasonForChoice2}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Acknowledgement */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Acknowledgement</h2>

            <div className="space-y-4">
              <div className="p-4 bg-accent/40 rounded-md">
                <h3 className="font-semibold text-foreground mb-2">Royal Rangers Motto</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">&quot;Ready&quot;</span> - Meaning of Motto: Ready
                  for anything! Ready to work, play, serve, worship, live, and obey God&apos;s Word.
                </p>
              </div>

              <div className="p-4 bg-accent/40 rounded-md">
                <h3 className="font-semibold text-foreground mb-2">Royal Rangers Pledge</h3>
                <p className="text-sm text-muted-foreground">
                  With God&apos;s help, I will do my best to: Serve God, my church, and my fellow
                  man. To live by the Ranger Code. To make the golden rule my daily rule.
                </p>
              </div>

              <div className="p-4 bg-accent/40 rounded-md">
                <h3 className="font-semibold text-foreground mb-2">Royal Rangers Code</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-bold">ALERT:</span> He is mentally, physically, and
                    spiritually alert.
                  </p>
                  <p>
                    <span className="font-bold">CLEAN:</span> He is clean in body, mind, and speech.
                  </p>
                  <p>
                    <span className="font-bold">HONEST:</span> He does not lie, cheat, or steal.
                  </p>
                  <p>
                    <span className="font-bold">COURAGEOUS:</span> He is brave in spite of danger,
                    criticism, or threats.
                  </p>
                  <p>
                    <span className="font-bold">LOYAL:</span> He is faithful to his church, family,
                    outpost, and friends.
                  </p>
                  <p>
                    <span className="font-bold">COURTEOUS:</span> He is polite, kind, and
                    thoughtful.
                  </p>
                  <p>
                    <span className="font-bold">OBEDIENT:</span> He obeys his parents, leaders, and
                    those in authority.
                  </p>
                  <p>
                    <span className="font-bold">SPIRITUAL:</span> He prays, reads the Bible, and
                    witnesses.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acknowledgement-view"
                  checked={application.acknowledgedMottoAndPledge}
                  disabled
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acknowledgement-view"
                    className="text-sm font-medium leading-none"
                  >
                    I acknowledge and agree
                  </label>
                  <p className="text-sm text-muted-foreground">
                    By applying for this programme, I agree to commit to coming for weekly
                    programmes, and understand that my mentor(s) may give me feedback with the
                    intention of preparing me to readiness towards becoming a commander.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RequireLogin>
      <ApplicationViewContent applicationId={id as Id<'jcepApplications'>} />
    </RequireLogin>
  );
}
