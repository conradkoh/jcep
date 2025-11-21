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
import { VisibilityControls } from '../admin/VisibilityControls';
import { BuddyEvaluationSection } from './BuddyEvaluationSection';
import { JCFeedbackSection } from './JCFeedbackSection';
import { JCReflectionSection } from './JCReflectionSection';
import { ParticularsSection } from './ParticularsSection';
import { ReviewFormProgress } from './ReviewFormProgress';

interface ReviewFormViewProps {
  formId: Id<'reviewForms'>;
}

export function ReviewFormView({ formId }: ReviewFormViewProps) {
  const { form, isLoading, sectionCompletion, canEditBuddySection, canEditJCSection, isAdmin } =
    useReviewForm(formId);
  const updateParticulars = useUpdateParticulars();
  const updateBuddyEvaluation = useUpdateBuddyEvaluation();
  const updateJCReflection = useUpdateJCReflection();
  const updateJCFeedback = useUpdateJCFeedback();
  const submitForm = useSubmitReviewForm();

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
            {form.buddyName} & {form.juniorCommanderName} ({form.ageGroup})
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

      {/* Admin visibility controls */}
      {isAdmin && (
        <>
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
            canEdit={!isSubmitted && canEditBuddySection}
            onUpdate={async (updates) => {
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
