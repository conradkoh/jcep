'use client';

import { EyeOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '../../hooks/useAutosave';
import type { QuestionResponse, ReviewForm } from '../../types';
import { JC_FEEDBACK_QUESTIONS } from './formQuestions';
import { SaveIndicator } from './SaveIndicator';

interface JCFeedbackSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (data: {
    gratitudeToBuddy: QuestionResponse;
    programFeedback: QuestionResponse;
  }) => Promise<void>;
}

type FieldName = 'gratitudeToBuddy' | 'programFeedback';

export function JCFeedbackSection({ form, canEdit, onUpdate }: JCFeedbackSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.jcFeedback);

  const [gratitudeToBuddy, setGratitudeToBuddy] = useState(
    form.jcFeedback?.gratitudeToBuddy.answer || ''
  );
  const [programFeedback, setProgramFeedback] = useState(
    form.jcFeedback?.programFeedback.answer || ''
  );

  // Track which fields are currently being saved
  const [savingFields, setSavingFields] = useState<Set<FieldName>>(new Set());

  const labelTexts = {
    gratitudeToBuddy: JC_FEEDBACK_QUESTIONS.gratitudeToBuddy,
    programFeedback: JC_FEEDBACK_QUESTIONS.programFeedback,
  } as const;

  // Autosave function for a specific field
  const createFieldSaveFn = useCallback(
    (field: FieldName) => async (data: { gratitudeToBuddy: string; programFeedback: string }) => {
      await onUpdate({
        gratitudeToBuddy: {
          questionText: JC_FEEDBACK_QUESTIONS.gratitudeToBuddy,
          answer: data.gratitudeToBuddy,
        },
        programFeedback: {
          questionText: JC_FEEDBACK_QUESTIONS.programFeedback,
          answer: data.programFeedback,
        },
      });
      // Clear this field from saving state after successful save
      setSavingFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    },
    [onUpdate]
  );

  // Create separate autosave instances for each field
  const gratitudeToBuddyAutosave = useAutosave(createFieldSaveFn('gratitudeToBuddy'), 1500);
  const programFeedbackAutosave = useAutosave(createFieldSaveFn('programFeedback'), 1500);

  const handleSave = async () => {
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
    }
  };

  const handleFieldChange = (field: FieldName, value: string) => {
    // Mark field as being saved
    setSavingFields((prev) => new Set(prev).add(field));

    // Update state and trigger field-specific autosave
    const data = { gratitudeToBuddy, programFeedback };

    switch (field) {
      case 'gratitudeToBuddy':
        setGratitudeToBuddy(value);
        gratitudeToBuddyAutosave.debouncedSave({ ...data, gratitudeToBuddy: value });
        break;
      case 'programFeedback':
        setProgramFeedback(value);
        programFeedbackAutosave.debouncedSave({ ...data, programFeedback: value });
        break;
    }
  };

  const handleCancel = () => {
    setGratitudeToBuddy(form.jcFeedback?.gratitudeToBuddy.answer || '');
    setProgramFeedback(form.jcFeedback?.programFeedback.answer || '');
    setIsEditing(false);
  };

  const getSaveStatus = (field: FieldName): 'saved' | 'modified' | 'none' => {
    // Check if this specific field is being saved
    const isFieldSaving =
      (field === 'gratitudeToBuddy' && gratitudeToBuddyAutosave.isSaving) ||
      (field === 'programFeedback' && programFeedbackAutosave.isSaving);

    // If field is in saving state (modified and debouncing/saving)
    if (savingFields.has(field) || isFieldSaving) return 'modified';

    // If field has been saved at least once (form exists)
    if (form.jcFeedback && !savingFields.has(field)) return 'saved';

    return 'none';
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
          <div className="flex items-center justify-between">
            <Label htmlFor="gratitudeToBuddy" className="text-sm font-medium text-foreground">
              {labelTexts.gratitudeToBuddy}
            </Label>
            <SaveIndicator status={getSaveStatus('gratitudeToBuddy')} />
          </div>
          <Textarea
            id="gratitudeToBuddy"
            value={gratitudeToBuddy}
            onChange={(e) => handleFieldChange('gratitudeToBuddy', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share any words of encouragement or gratitude for your buddy. :)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="programFeedback" className="text-sm font-medium text-foreground">
              {labelTexts.programFeedback}
            </Label>
            <SaveIndicator status={getSaveStatus('programFeedback')} />
          </div>
          <Textarea
            id="programFeedback"
            value={programFeedback}
            onChange={(e) => handleFieldChange('programFeedback', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Write anything positive and any areas for improvement for the programme."
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={gratitudeToBuddyAutosave.isSaving || programFeedbackAutosave.isSaving}
          >
            {gratitudeToBuddyAutosave.isSaving || programFeedbackAutosave.isSaving
              ? 'Saving...'
              : 'Save'}
          </Button>
          {isComplete && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={gratitudeToBuddyAutosave.isSaving || programFeedbackAutosave.isSaving}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
