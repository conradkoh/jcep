'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Check, Lock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BuddyEvaluationSection } from './BuddyEvaluationSection';
import { JCFeedbackSection } from './JCFeedbackSection';
import { JCReflectionSection } from './JCReflectionSection';
import { ParticularsSection } from './ParticularsSection';
import { useReviewFormAccess } from '../../hooks/useReviewFormAccess';
import { getSectionAccessRules } from '../../utils/sectionAccessControl';
import type { AccessLevel } from '../../utils/sectionAccessControl';

interface ReviewFormViewProps {
  formId: Id<'reviewForms'>;
  accessToken?: string | null;
}

export function ReviewFormView({ formId, accessToken }: ReviewFormViewProps) {
  // Unified hook handles both session and token access automatically
  const {
    form,
    isLoading,
    sectionCompletion,
    canEditParticulars,
    canEditBuddyEvaluation,
    canEditJCReflection,
    canEditJCFeedback,
    isAdmin,
    updateParticulars,
    updateBuddyEvaluation,
    updateJCReflection,
    updateJCFeedback,
  } = useReviewFormAccess(formId, accessToken);

  // Determine access level for section locking
  const accessLevel = useMemo<AccessLevel>(() => {
    if (isAdmin) return 'admin';
    if (canEditBuddyEvaluation && !canEditJCReflection) return 'buddy';
    if (canEditJCReflection) return 'jc';
    return 'none';
  }, [isAdmin, canEditBuddyEvaluation, canEditJCReflection]);

  // Get section access rules
  const sectionAccess = useMemo(() => {
    if (!form) return null;
    return getSectionAccessRules(accessLevel, form);
  }, [accessLevel, form]);

  const steps = useMemo(
    () => [
      {
        id: 'buddy' as StepId,
        label: 'Buddy Evaluation',
        completed: sectionCompletion.buddyEvaluation,
        locked: !sectionAccess?.canAccessBuddyEvaluation,
      },
      {
        id: 'jc-reflection' as StepId,
        label: 'JC Reflection',
        completed: sectionCompletion.jcReflection,
        locked: !sectionAccess?.canAccessJCReflection,
      },
      {
        id: 'jc-feedback' as StepId,
        label: 'JC Feedback',
        completed: sectionCompletion.jcFeedback,
        locked: !sectionAccess?.canAccessJCFeedback,
      },
    ],
    [sectionCompletion, sectionAccess]
  );

  // Determine the preferred step based on what the user can access/edit
  // Prioritize sections the user can edit, then fall back to sections they can view
  const preferredStep = useMemo<StepId>(() => {
    // First, prefer sections the user can edit
    if (canEditBuddyEvaluation) return 'buddy';
    if (canEditJCReflection) return 'jc-reflection';
    if (canEditJCFeedback) return 'jc-feedback';

    // Fall back to first accessible section (for view-only access)
    if (sectionAccess?.canAccessBuddyEvaluation) return 'buddy';
    if (sectionAccess?.canAccessJCReflection) return 'jc-reflection';
    if (sectionAccess?.canAccessJCFeedback) return 'jc-feedback';

    // Default to buddy if nothing else matches
    return 'buddy';
  }, [canEditBuddyEvaluation, canEditJCReflection, canEditJCFeedback, sectionAccess]);

  const [activeStep, setActiveStep] = useState<StepId>(preferredStep);
  const userSelectedStep = useRef(false);

  useEffect(() => {
    if (!userSelectedStep.current) {
      setActiveStep(preferredStep);
    }
  }, [preferredStep]);

  const handleStepSelect = (id: StepId, locked: boolean) => {
    if (locked) return; // Don't switch to locked sections
    userSelectedStep.current = true;
    setActiveStep(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  const isSubmitted = form.status === 'submitted';

  return (
    <div className="space-y-6">
      <a
        href="#review-form-main"
        className="sr-only inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to form sections
      </a>

      <div id="review-form-main" className="space-y-6">
        <ParticularsSection
          form={form}
          canEdit={canEditParticulars}
          onUpdate={async (updates) => {
            await updateParticulars({ formId, ...updates });
          }}
          buddyName={form.buddyName}
          juniorCommanderName={form.juniorCommanderName}
          ageGroup={form.ageGroup}
          isSubmitted={isSubmitted}
        />

        <Stepper activeStep={activeStep} steps={steps} onSelectStep={handleStepSelect} />

        {activeStep === 'buddy' && sectionAccess?.canAccessBuddyEvaluation && (
          <BuddyEvaluationSection
            form={form}
            canEdit={!isSubmitted && canEditBuddyEvaluation}
            onUpdate={async (data) => {
              await updateBuddyEvaluation({ formId, ...data });
            }}
          />
        )}

        {activeStep === 'jc-reflection' && sectionAccess?.canAccessJCReflection && (
          <JCReflectionSection
            form={form}
            canEdit={!isSubmitted && canEditJCReflection}
            onUpdate={async (data) => {
              await updateJCReflection({ formId, ...data });
            }}
          />
        )}

        {activeStep === 'jc-feedback' && sectionAccess?.canAccessJCFeedback && (
          <JCFeedbackSection
            form={form}
            canEdit={!isSubmitted && canEditJCFeedback}
            onUpdate={async (data) => {
              await updateJCFeedback({ formId, ...data });
            }}
          />
        )}

        {/* Show locked message if trying to view locked section */}
        {((activeStep === 'buddy' && !sectionAccess?.canAccessBuddyEvaluation) ||
          (activeStep === 'jc-reflection' && !sectionAccess?.canAccessJCReflection) ||
          (activeStep === 'jc-feedback' && !sectionAccess?.canAccessJCFeedback)) && (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Section Locked</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You don't have access to this section. Only authorized participants can view and edit
              their assigned sections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type StepId = 'buddy' | 'jc-reflection' | 'jc-feedback';

interface StepperProps {
  activeStep: StepId;
  steps: { id: StepId; label: string; completed: boolean; locked: boolean }[];
  onSelectStep: (id: StepId, locked: boolean) => void;
}

function Stepper({ activeStep, steps, onSelectStep }: StepperProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">Form Sections</p>
      <ol className="mt-3 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = activeStep === step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStep(step.id, step.locked)}
                disabled={step.locked}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                  step.locked
                    ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
                    : isActive
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-foreground hover:bg-accent/50'
                }`}
                aria-current={isActive ? 'step' : undefined}
                aria-disabled={step.locked}
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    step.locked
                      ? 'border-muted-foreground bg-muted text-muted-foreground'
                      : step.completed
                        ? 'border-green-600 bg-green-600 text-white dark:border-green-400 dark:bg-green-400'
                        : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step.locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : step.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.locked ? 'Locked' : step.completed ? 'Completed' : 'In progress'}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
