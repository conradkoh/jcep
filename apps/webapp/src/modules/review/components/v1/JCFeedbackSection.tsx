'use client';

import { EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionResponse, ReviewForm } from '../../types';
import { JC_FEEDBACK_QUESTIONS } from './formQuestions';

interface JCFeedbackSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (data: {
    gratitudeToBuddy: QuestionResponse;
    programFeedback: QuestionResponse;
  }) => Promise<void>;
}

export function JCFeedbackSection({ form, canEdit, onUpdate }: JCFeedbackSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.jcFeedback);
  const [isSaving, setIsSaving] = useState(false);

  const [gratitudeToBuddy, setGratitudeToBuddy] = useState(
    form.jcFeedback?.gratitudeToBuddy.answer || ''
  );
  const [programFeedback, setProgramFeedback] = useState(
    form.jcFeedback?.programFeedback.answer || ''
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        gratitudeToBuddy: {
          questionText: JC_FEEDBACK_QUESTIONS.gratitudeToBuddy,
          answer: gratitudeToBuddy,
        },
        programFeedback: {
          questionText: JC_FEEDBACK_QUESTIONS.programFeedback,
          answer: programFeedback,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update JC feedback:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setGratitudeToBuddy(form.jcFeedback?.gratitudeToBuddy.answer || '');
    setProgramFeedback(form.jcFeedback?.programFeedback.answer || '');
    setIsEditing(false);
  };

  const isComplete = form.jcFeedback !== null;

  // V2: Show hidden message if responses are not visible
  if (!form.jcFeedback && !canEdit) {
    return (
      <Alert>
        <EyeOff className="h-4 w-4" />
        <AlertTitle>Responses Hidden</AlertTitle>
        <AlertDescription>
          The Junior Commander's feedback is currently hidden by the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isEditing && isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Feedback to Buddy & Programme</h3>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcFeedback?.gratitudeToBuddy.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcFeedback?.gratitudeToBuddy.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcFeedback?.programFeedback.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcFeedback?.programFeedback.answer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Feedback to Buddy & Programme</h3>
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-muted-foreground">
          This section has not been completed yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Feedback to Buddy & Programme</h3>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <Label htmlFor="gratitudeToBuddy" className="text-sm font-medium text-foreground">
            {JC_FEEDBACK_QUESTIONS.gratitudeToBuddy}
          </Label>
          <Textarea
            id="gratitudeToBuddy"
            value={gratitudeToBuddy}
            onChange={(e) => setGratitudeToBuddy(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share your gratitude and encouragement..."
          />
        </div>

        <div>
          <Label htmlFor="programFeedback" className="text-sm font-medium text-foreground">
            {JC_FEEDBACK_QUESTIONS.programFeedback}
          </Label>
          <Textarea
            id="programFeedback"
            value={programFeedback}
            onChange={(e) => setProgramFeedback(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share feedback about the programme..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {isComplete && (
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
