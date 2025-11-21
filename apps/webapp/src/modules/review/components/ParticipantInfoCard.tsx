/**
 * Participant Info Card
 * Shows participant names and other participant's progress on token access page
 */

'use client';

'use client';

import type { ReviewForm, TokenAccessLevel } from '../types';

export interface ParticipantInfoCardProps {
  form: ReviewForm;
  accessLevel: TokenAccessLevel;
}

const getBuddyProgress = (form: ReviewForm) => {
  if (form.buddyEvaluation === null) {
    return 'Not started';
  }
  return 'Completed';
};

const getJCProgress = (form: ReviewForm) => {
  const completed = [form.jcReflection !== null, form.jcFeedback !== null].filter(Boolean).length;
  const total = 2;

  if (completed === 0) return 'Not started';
  if (completed === total) return 'Completed';
  return `${completed}/${total} sections`;
};

export function ParticipantInfoCard({ form, accessLevel }: ParticipantInfoCardProps) {
  const isBuddy = accessLevel === 'buddy';
  const welcomeName = isBuddy ? form.buddyName : form.juniorCommanderName;
  const counterpartName = isBuddy ? form.juniorCommanderName : form.buddyName;
  const counterpartLabel = isBuddy ? 'Junior Commander' : 'Buddy';
  const counterpartStatus = isBuddy ? getJCProgress(form) : getBuddyProgress(form);

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4">
      <p className="text-lg font-semibold text-foreground">Welcome, {welcomeName}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {isBuddy ? 'Buddy access link' : 'Junior Commander access link'}
      </p>
      <p className="text-xs text-muted-foreground">
        {counterpartLabel}: {counterpartName} · Status: {counterpartStatus}
      </p>
    </div>
  );
}
