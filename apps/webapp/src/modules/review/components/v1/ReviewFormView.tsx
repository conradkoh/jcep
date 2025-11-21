'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useReviewForm,
  useSubmitReviewForm,
  useUpdateBuddyEvaluation,
  useUpdateJCFeedback,
  useUpdateJCReflection,
  useUpdateParticulars,
} from '../../hooks/useReviewForm';
import { useReviewFormByToken } from '../../hooks/useReviewFormByToken';
import {
  useUpdateBuddyEvaluationByToken,
  useUpdateJCFeedbackByToken,
  useUpdateJCReflectionByToken,
} from '../../hooks/useTokenMutations';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
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
  // Use token-based access if token is provided
  const sessionData = useReviewForm(accessToken ? null : formId);
  const tokenData = useReviewFormByToken(accessToken);

  // Extract common properties
  const data = accessToken ? tokenData : sessionData;
  const form = data.form;
  const isLoading = data.isLoading;
  const sectionCompletion = data.sectionCompletion;

  // Handle differences in return types
  const canEditBuddySection =
    'canEditBuddySection' in data ? data.canEditBuddySection : data.canEditBuddyEvaluation;

  const canEditJCSection =
    'canEditJCSection' in data
      ? data.canEditJCSection
      : data.canEditJCReflection || data.canEditJCFeedback;

  const isAdmin = 'isAdmin' in data ? data.isAdmin : false;

  // Session-based mutations
  const updateParticularsSession = useUpdateParticulars();
  const updateBuddyEvaluationSession = useUpdateBuddyEvaluation();
  const updateJCReflectionSession = useUpdateJCReflection();
  const updateJCFeedbackSession = useUpdateJCFeedback();
  const submitFormSession = useSubmitReviewForm();

  // Token-based mutations
  const updateBuddyEvaluationToken = useUpdateBuddyEvaluationByToken(accessToken);
  const updateJCReflectionToken = useUpdateJCReflectionByToken(accessToken);
  const updateJCFeedbackToken = useUpdateJCFeedbackByToken(accessToken);

  // Select the appropriate mutations based on access type
  const updateParticulars = accessToken ? null : updateParticularsSession;
  const updateBuddyEvaluation = accessToken
    ? updateBuddyEvaluationToken
    : updateBuddyEvaluationSession;
  const updateJCReflection = accessToken ? updateJCReflectionToken : updateJCReflectionSession;
  const updateJCFeedback = accessToken ? updateJCFeedbackToken : updateJCFeedbackSession;
  const submitForm = accessToken ? null : submitFormSession;

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

  const isComplete =
    sectionCompletion.buddyEvaluation &&
    sectionCompletion.jcReflection &&
    sectionCompletion.jcFeedback;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Form - {form.rotationYear}</h1>
          <p className="text-sm text-muted-foreground">
            {form.buddyName} & {form.juniorCommanderName} ({getAgeGroupLabel(form.ageGroup)})
          </p>
        </div>
        {isComplete && !isSubmitted && <Button onClick={handleSubmit}>Submit Form</Button>}
        {isSubmitted && (
          <div className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400">
            Submitted
          </div>
        )}
      </div>

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

      <Tabs defaultValue="particulars" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="particulars">Particulars</TabsTrigger>
          <TabsTrigger value="buddy">Buddy Evaluation</TabsTrigger>
          <TabsTrigger value="jc-reflection">JC Reflection</TabsTrigger>
          <TabsTrigger value="jc-feedback">JC Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="particulars" className="space-y-4">
          <ParticularsSection
            form={form}
            canEdit={!isSubmitted && canEditBuddySection && !accessToken}
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
          />
        </TabsContent>

        <TabsContent value="buddy" className="space-y-4">
          <BuddyEvaluationSection
            form={form}
            canEdit={!isSubmitted && canEditBuddySection}
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
        </TabsContent>

        <TabsContent value="jc-reflection" className="space-y-4">
          <JCReflectionSection
            form={form}
            canEdit={!isSubmitted && canEditJCSection}
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
        </TabsContent>

        <TabsContent value="jc-feedback" className="space-y-4">
          <JCFeedbackSection
            form={form}
            canEdit={!isSubmitted && canEditJCSection}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
