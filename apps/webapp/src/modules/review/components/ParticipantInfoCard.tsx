/**
 * Participant Info Card
 * Shows participant names and other participant's progress on token access page
 */

'use client';

import { CheckCircle2, Circle, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReviewForm, TokenAccessLevel } from '../types';
import { getAgeGroupLabel } from '../utils/ageGroupLabels';

export interface ParticipantInfoCardProps {
  form: ReviewForm;
  accessLevel: TokenAccessLevel;
}

export function ParticipantInfoCard({ form, accessLevel }: ParticipantInfoCardProps) {
  // Calculate progress for the other participant
  const getBuddyProgress = () => {
    if (form.buddyEvaluation === null) {
      return {
        status: 'not-started' as const,
        label: 'Not Started',
        icon: <Circle className="h-4 w-4" />,
        className: 'bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400',
      };
    }
    return {
      status: 'completed' as const,
      label: 'Completed',
      icon: <CheckCircle2 className="h-4 w-4" />,
      className: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400',
    };
  };

  const getJCProgress = () => {
    const completed = [form.jcReflection !== null, form.jcFeedback !== null].filter(Boolean).length;
    const total = 2;

    if (completed === 0) {
      return {
        status: 'not-started' as const,
        label: 'Not Started',
        icon: <Circle className="h-4 w-4" />,
        className: 'bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400',
      };
    }
    if (completed === total) {
      return {
        status: 'completed' as const,
        label: 'Completed',
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400',
      };
    }
    return {
      status: 'in-progress' as const,
      label: `${completed}/${total} Sections`,
      icon: <Circle className="h-4 w-4" />,
      className: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
    };
  };

  const buddyProgress = getBuddyProgress();
  const jcProgress = getJCProgress();

  if (accessLevel === 'buddy') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Participant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Your info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                You are
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{form.buddyName}</p>
                <p className="text-sm text-muted-foreground">Buddy</p>
              </div>
            </div>

            {/* JC info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Junior Commander
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{form.juniorCommanderName}</p>
                <p className="text-sm text-muted-foreground">{getAgeGroupLabel(form.ageGroup)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">JC's Progress:</span>
              <Badge variant="outline" className={jcProgress.className}>
                {jcProgress.icon}
                <span className="ml-1">{jcProgress.label}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // JC view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Participant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Your info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              You are
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{form.juniorCommanderName}</p>
              <p className="text-sm text-muted-foreground">
                Junior Commander ({getAgeGroupLabel(form.ageGroup)})
              </p>
            </div>
          </div>

          {/* Buddy info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Your Buddy
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{form.buddyName}</p>
              <p className="text-sm text-muted-foreground">Buddy</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Buddy's Progress:</span>
            <Badge variant="outline" className={buddyProgress.className}>
              {buddyProgress.icon}
              <span className="ml-1">{buddyProgress.label}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
