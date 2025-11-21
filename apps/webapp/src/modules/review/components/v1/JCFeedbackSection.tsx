'use client';

// Imports
import { EyeOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '../../hooks/useAutosave';
import type { QuestionResponse, ReviewForm } from '../../types';
import { validatePayload } from '../../utils/autosaveHelpers';
import { JC_FEEDBACK_QUESTIONS } from './formQuestions';
import { SaveIndicator } from './SaveIndicator';

// Public interfaces and types
/**
 * Props for the JCFeedbackSection component.
 * Handles the Junior Commander's feedback to their buddy and the program with autosave functionality.
 *
 * @example
 * ```typescript
 * <JCFeedbackSection
 *   form={reviewForm}
 *   canEdit={true}
 *   onUpdate={async (data) => {
 *     await updateJCFeedback({ formId, ...data });
 *   }}
 * />
 * ```
 */
export interface JCFeedbackSectionProps {
  /** The review form containing JC feedback data */
  form: ReviewForm;
  /** Whether the current user can edit this section */
  canEdit: boolean;
  /** Callback function called when feedback data is updated */
  onUpdate: (data: {
    gratitudeToBuddy: QuestionResponse;
    programFeedback: QuestionResponse;
  }) => Promise<void>;
}

/**
 * Field names available in the JC feedback section.
 */
export type FieldName = 'gratitudeToBuddy' | 'programFeedback';

// Internal types
type _SaveStatus = 'saved' | 'modified' | 'none';

// Exported component
/**
 * JC Feedback section component with autosave functionality.
 * Allows Junior Commanders to provide feedback to their buddy and the program.
 * Changes are automatically saved after 1.5 seconds of inactivity.
 */
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

  // Create refs to hold the latest state values to prevent stale closures in autosave
  const gratitudeToBuddyRef = useRef(gratitudeToBuddy);
  const programFeedbackRef = useRef(programFeedback);

  // Keep refs in sync with state
  useEffect(() => {
    gratitudeToBuddyRef.current = gratitudeToBuddy;
  }, [gratitudeToBuddy]);

  useEffect(() => {
    programFeedbackRef.current = programFeedback;
  }, [programFeedback]);

  const _labelTexts = useMemo(
    () => ({
      gratitudeToBuddy: JC_FEEDBACK_QUESTIONS.gratitudeToBuddy,
      programFeedback: JC_FEEDBACK_QUESTIONS.programFeedback,
    }),
    []
  );

  // Autosave function for a specific field
  // Uses refs to avoid stale closure issues when multiple fields change rapidly
  const _createFieldSaveFn = useCallback(
    (field: FieldName) => async () => {
      const payload = {
        gratitudeToBuddy: {
          questionText: JC_FEEDBACK_QUESTIONS.gratitudeToBuddy,
          answer: gratitudeToBuddyRef.current, // Use ref for latest value
        },
        programFeedback: {
          questionText: JC_FEEDBACK_QUESTIONS.programFeedback,
          answer: programFeedbackRef.current, // Use ref for latest value
        },
      };

      // Validate payload in development
      validatePayload(
        payload,
        ['gratitudeToBuddy', 'programFeedback'],
        `JCFeedbackSection ${field} autosave`
      );

      await onUpdate(payload);

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
  const gratitudeToBuddyAutosave = useAutosave<void>(_createFieldSaveFn('gratitudeToBuddy'), 1500);
  const programFeedbackAutosave = useAutosave<void>(_createFieldSaveFn('programFeedback'), 1500);

  const _handleClose = useCallback(() => {
    // Autosave handles saving automatically, so we just close the edit mode
    setIsEditing(false);
  }, []);

  const _handleFieldChange = useCallback(
    (field: FieldName, value: string) => {
      // Mark field as being saved
      setSavingFields((prev) => new Set(prev).add(field));

      // Update state and trigger field-specific autosave
      // Note: Pass undefined as the autosave callback reads from refs
      switch (field) {
        case 'gratitudeToBuddy':
          setGratitudeToBuddy(value);
          gratitudeToBuddyAutosave.debouncedSave(undefined);
          break;
        case 'programFeedback':
          setProgramFeedback(value);
          programFeedbackAutosave.debouncedSave(undefined);
          break;
      }
    },
    [gratitudeToBuddyAutosave, programFeedbackAutosave]
  );

  const isComplete = form.jcFeedback !== null;

  const _isSaving = useMemo(
    () => gratitudeToBuddyAutosave.isSaving || programFeedbackAutosave.isSaving,
    [gratitudeToBuddyAutosave.isSaving, programFeedbackAutosave.isSaving]
  );

  /**
   * Determines the save status for a specific field.
   * @param field - The field name to check
   * @returns The current save status: 'saved', 'modified', or 'none'
   */
  const _getSaveStatus = useCallback(
    (field: FieldName): _SaveStatus => {
      // Check if this specific field is being saved
      const isFieldSaving =
        (field === 'gratitudeToBuddy' && gratitudeToBuddyAutosave.isSaving) ||
        (field === 'programFeedback' && programFeedbackAutosave.isSaving);

      // If field is in saving state (modified and debouncing/saving)
      if (savingFields.has(field) || isFieldSaving) return 'modified';

      // If field has been saved at least once (form exists)
      if (form.jcFeedback && !savingFields.has(field)) return 'saved';

      return 'none';
    },
    [
      gratitudeToBuddyAutosave.isSaving,
      programFeedbackAutosave.isSaving,
      savingFields,
      form.jcFeedback,
    ]
  );

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
              {_labelTexts.gratitudeToBuddy}
            </Label>
            <SaveIndicator status={_getSaveStatus('gratitudeToBuddy')} />
          </div>
          <Textarea
            id="gratitudeToBuddy"
            value={gratitudeToBuddy}
            onChange={(e) => _handleFieldChange('gratitudeToBuddy', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share any words of encouragement or gratitude for your buddy. :)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="programFeedback" className="text-sm font-medium text-foreground">
              {_labelTexts.programFeedback}
            </Label>
            <SaveIndicator status={_getSaveStatus('programFeedback')} />
          </div>
          <Textarea
            id="programFeedback"
            value={programFeedback}
            onChange={(e) => _handleFieldChange('programFeedback', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Write anything positive and any areas for improvement for the programme."
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={_handleClose} disabled={_isSaving}>
            {_isSaving ? 'Saving...' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
}
