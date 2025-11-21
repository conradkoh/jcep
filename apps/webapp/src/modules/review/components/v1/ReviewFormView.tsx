'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useReviewFormAccess } from '../../hooks/useReviewFormAccess';
import { TokenDisplay } from '../admin/TokenDisplay';
import { VisibilityControls } from '../admin/VisibilityControls';
import { BuddyEvaluationSection } from './BuddyEvaluationSection';
import { JCFeedbackSection } from './JCFeedbackSection';
import { JCReflectionSection } from './JCReflectionSection';
import { ParticularsSection } from './ParticularsSection';
import { ReviewFormProgress } from './ReviewFormProgress';

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
    canSubmit,
    isAdmin,
    updateParticulars,
    updateBuddyEvaluation,
    updateJCReflection,
    updateJCFeedback,
    submitForm,
  } = useReviewFormAccess(formId, accessToken);

  const isComplete =
    sectionCompletion.buddyEvaluation &&
    sectionCompletion.jcReflection &&
    sectionCompletion.jcFeedback;

  const steps = useMemo(
    () => [
      {
        id: 'buddy' as StepId,
        label: 'Buddy Evaluation',
        completed: sectionCompletion.buddyEvaluation,
      },
      {
        id: 'jc-reflection' as StepId,
        label: 'JC Reflection',
        completed: sectionCompletion.jcReflection,
      },
      {
        id: 'jc-feedback' as StepId,
        label: 'JC Feedback',
        completed: sectionCompletion.jcFeedback,
      },
    ],
    [sectionCompletion]
  );

  const preferredStep = useMemo<StepId>(() => {
    if (canEditBuddyEvaluation) return 'buddy';
    if (canEditJCReflection) return 'jc-reflection';
    if (canEditJCFeedback) return 'jc-feedback';
    return 'buddy';
  }, [canEditBuddyEvaluation, canEditJCReflection, canEditJCFeedback]);

  const [activeStep, setActiveStep] = useState<StepId>(preferredStep);
  const userSelectedStep = useRef(false);

  useEffect(() => {
    if (!userSelectedStep.current) {
      setActiveStep(preferredStep);
    }
  }, [preferredStep]);

  const handleStepSelect = (id: StepId) => {
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

  const handleSubmit = async () => {
    if (!submitForm) {
      toast.error('Submit not available for token-based access');
      return;
    }
    try {
      await submitForm(formId);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit form');
    }
  };

  return (
    <div className="space-y-6">
      <a
        href="#review-form-main"
        className="sr-only inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to form sections
      </a>

      <ReviewFormProgress sectionCompletion={sectionCompletion} />

      <Separator />

      {/* Admin controls */}
      {isAdmin && (
        <>
          <TokenDisplay form={form} />
          <Separator />
          <VisibilityControls form={form} />
          <Separator />
        </>
      )}

      <div id="review-form-main" className="space-y-6">
        <ParticularsSection
          form={form}
          canEdit={!isSubmitted && canEditParticulars}
          onUpdate={async (updates) => {
            if (!updateParticulars) {
              toast.error('Particulars editing not available for token-based access');
              throw new Error('Particulars editing not available');
            }
            try {
              await updateParticulars({ formId, ...updates });
              toast.success('Particulars updated successfully!');
            } catch (error) {
              toast.error('Failed to update particulars');
              throw error;
            }
          }}
          rotationYear={form.rotationYear}
          buddyName={form.buddyName}
          juniorCommanderName={form.juniorCommanderName}
          ageGroup={form.ageGroup}
          isComplete={isComplete}
          isSubmitted={isSubmitted}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
        />

        <Stepper activeStep={activeStep} steps={steps} onSelectStep={handleStepSelect} />

        {activeStep === 'buddy' && (
          <BuddyEvaluationSection
            form={form}
            canEdit={!isSubmitted && canEditBuddyEvaluation}
            onUpdate={async (data) => {
              try {
                await updateBuddyEvaluation({ formId, ...data });
                toast.success('Buddy evaluation saved successfully!');
              } catch (error) {
                toast.error('Failed to save buddy evaluation');
                throw error;
              }
            }}
          />
        )}

        {activeStep === 'jc-reflection' && (
          <JCReflectionSection
            form={form}
            canEdit={!isSubmitted && canEditJCReflection}
            onUpdate={async (data) => {
              try {
                await updateJCReflection({ formId, ...data });
                toast.success('Reflection saved successfully!');
              } catch (error) {
                toast.error('Failed to save reflection');
                throw error;
              }
            }}
          />
        )}

        {activeStep === 'jc-feedback' && (
          <JCFeedbackSection
            form={form}
            canEdit={!isSubmitted && canEditJCFeedback}
            onUpdate={async (data) => {
              try {
                await updateJCFeedback({ formId, ...data });
                toast.success('Feedback saved successfully!');
              } catch (error) {
                toast.error('Failed to save feedback');
                throw error;
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

type StepId = 'buddy' | 'jc-reflection' | 'jc-feedback';

interface StepperProps {
  activeStep: StepId;
  steps: Array<{ id: StepId; label: string; completed: boolean }>;
  onSelectStep: (id: StepId) => void;
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
                onClick={() => onSelectStep(step.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                  isActive
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-foreground'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                    step.completed
                      ? 'border-green-600 bg-green-600 text-white dark:border-green-400 dark:bg-green-400'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.completed ? 'Completed' : 'In progress'}
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
