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
import { BUDDY_EVALUATION_QUESTIONS } from './formQuestions';
import { SaveIndicator } from './SaveIndicator';

// Public interfaces and types
/**
 * Props for the BuddyEvaluationSection component.
 * Handles the buddy's evaluation of their Junior Commander with autosave functionality.
 *
 * @example
 * ```typescript
 * <BuddyEvaluationSection
 *   form={reviewForm}
 *   canEdit={true}
 *   onUpdate={async (data) => {
 *     await updateBuddyEvaluation({ formId, ...data });
 *   }}
 * />
 * ```
 */
export interface BuddyEvaluationSectionProps {
  /** The review form containing buddy evaluation data */
  form: ReviewForm;
  /** Whether the current user can edit this section */
  canEdit: boolean;
  /** Callback function called when evaluation data is updated */
  onUpdate: (data: {
    tasksParticipated: QuestionResponse;
    strengths: QuestionResponse;
    areasForImprovement: QuestionResponse;
    wordsOfEncouragement: QuestionResponse;
  }) => Promise<void>;
}

/**
 * Field names available in the buddy evaluation section.
 */
export type FieldName =
  | 'tasksParticipated'
  | 'strengths'
  | 'areasForImprovement'
  | 'wordsOfEncouragement';

// Internal types
type _SaveStatus = 'saved' | 'modified' | 'none';

// Exported component
/**
 * Buddy Evaluation section component with autosave functionality.
 * Allows buddies to evaluate their Junior Commander across four key areas:
 * tasks participated, strengths, areas for improvement, and words of encouragement.
 * Changes are automatically saved after 1.5 seconds of inactivity.
 */
export function BuddyEvaluationSection({ form, canEdit, onUpdate }: BuddyEvaluationSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.buddyEvaluation);

  const [tasksParticipated, setTasksParticipated] = useState(
    form.buddyEvaluation?.tasksParticipated.answer || ''
  );
  const [strengths, setStrengths] = useState(form.buddyEvaluation?.strengths.answer || '');
  const [areasForImprovement, setAreasForImprovement] = useState(
    form.buddyEvaluation?.areasForImprovement.answer || ''
  );
  const [wordsOfEncouragement, setWordsOfEncouragement] = useState(
    form.buddyEvaluation?.wordsOfEncouragement.answer || ''
  );

  // Track which fields are currently being saved (modified but not yet saved)
  const [savingFields, setSavingFields] = useState<Set<FieldName>>(new Set());

  // Create refs to hold the latest state values to prevent stale closures in autosave
  const tasksParticipatedRef = useRef(tasksParticipated);
  const strengthsRef = useRef(strengths);
  const areasForImprovementRef = useRef(areasForImprovement);
  const wordsOfEncouragementRef = useRef(wordsOfEncouragement);

  // Keep refs in sync with state
  useEffect(() => {
    tasksParticipatedRef.current = tasksParticipated;
  }, [tasksParticipated]);

  useEffect(() => {
    strengthsRef.current = strengths;
  }, [strengths]);

  useEffect(() => {
    areasForImprovementRef.current = areasForImprovement;
  }, [areasForImprovement]);

  useEffect(() => {
    wordsOfEncouragementRef.current = wordsOfEncouragement;
  }, [wordsOfEncouragement]);

  const _labelTexts = useMemo(
    () => ({
      tasksParticipated: BUDDY_EVALUATION_QUESTIONS.tasksParticipated,
      strengths: BUDDY_EVALUATION_QUESTIONS.strengths,
      areasForImprovement: BUDDY_EVALUATION_QUESTIONS.areasForImprovement,
      wordsOfEncouragement: BUDDY_EVALUATION_QUESTIONS.wordsOfEncouragement,
    }),
    []
  );

  // Autosave function for a specific field
  // Uses refs to avoid stale closure issues when multiple fields change rapidly
  const _createFieldSaveFn = useCallback(
    (field: FieldName) => async () => {
      const payload = {
        tasksParticipated: {
          questionText: BUDDY_EVALUATION_QUESTIONS.tasksParticipated,
          answer: tasksParticipatedRef.current, // Use ref for latest value
        },
        strengths: {
          questionText: BUDDY_EVALUATION_QUESTIONS.strengths,
          answer: strengthsRef.current, // Use ref for latest value
        },
        areasForImprovement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.areasForImprovement,
          answer: areasForImprovementRef.current, // Use ref for latest value
        },
        wordsOfEncouragement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.wordsOfEncouragement,
          answer: wordsOfEncouragementRef.current, // Use ref for latest value
        },
      };

      // Validate payload in development
      validatePayload(
        payload,
        ['tasksParticipated', 'strengths', 'areasForImprovement', 'wordsOfEncouragement'],
        `BuddyEvaluationSection ${field} autosave`
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
  const tasksParticipatedAutosave = useAutosave<void>(
    _createFieldSaveFn('tasksParticipated'),
    1500
  );
  const strengthsAutosave = useAutosave<void>(_createFieldSaveFn('strengths'), 1500);
  const areasForImprovementAutosave = useAutosave<void>(
    _createFieldSaveFn('areasForImprovement'),
    1500
  );
  const wordsOfEncouragementAutosave = useAutosave<void>(
    _createFieldSaveFn('wordsOfEncouragement'),
    1500
  );

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
        case 'tasksParticipated':
          setTasksParticipated(value);
          tasksParticipatedAutosave.debouncedSave(undefined);
          break;
        case 'strengths':
          setStrengths(value);
          strengthsAutosave.debouncedSave(undefined);
          break;
        case 'areasForImprovement':
          setAreasForImprovement(value);
          areasForImprovementAutosave.debouncedSave(undefined);
          break;
        case 'wordsOfEncouragement':
          setWordsOfEncouragement(value);
          wordsOfEncouragementAutosave.debouncedSave(undefined);
          break;
      }
    },
    [
      tasksParticipatedAutosave,
      strengthsAutosave,
      areasForImprovementAutosave,
      wordsOfEncouragementAutosave,
    ]
  );

  const isComplete = form.buddyEvaluation !== null;

  const _isSaving = useMemo(
    () =>
      tasksParticipatedAutosave.isSaving ||
      strengthsAutosave.isSaving ||
      areasForImprovementAutosave.isSaving ||
      wordsOfEncouragementAutosave.isSaving,
    [
      tasksParticipatedAutosave.isSaving,
      strengthsAutosave.isSaving,
      areasForImprovementAutosave.isSaving,
      wordsOfEncouragementAutosave.isSaving,
    ]
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
        (field === 'tasksParticipated' && tasksParticipatedAutosave.isSaving) ||
        (field === 'strengths' && strengthsAutosave.isSaving) ||
        (field === 'areasForImprovement' && areasForImprovementAutosave.isSaving) ||
        (field === 'wordsOfEncouragement' && wordsOfEncouragementAutosave.isSaving);

      // If field is in saving state (modified and debouncing/saving)
      if (savingFields.has(field) || isFieldSaving) return 'modified';

      // If field has been saved at least once (form exists)
      if (form.buddyEvaluation && !savingFields.has(field)) return 'saved';

      return 'none';
    },
    [
      tasksParticipatedAutosave.isSaving,
      strengthsAutosave.isSaving,
      areasForImprovementAutosave.isSaving,
      wordsOfEncouragementAutosave.isSaving,
      savingFields,
      form.buddyEvaluation,
    ]
  );

  // V2: Show hidden message if responses are not visible
  if (!form.buddyEvaluation && !canEdit) {
    return (
      <Alert>
        <EyeOff className="h-4 w-4" />
        <AlertTitle>Responses Hidden</AlertTitle>
        <AlertDescription>
          The Buddy's evaluation is currently hidden by the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isEditing && isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Buddy Evaluation</h3>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.buddyEvaluation?.tasksParticipated.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.buddyEvaluation?.tasksParticipated.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.buddyEvaluation?.strengths.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.buddyEvaluation?.strengths.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.buddyEvaluation?.areasForImprovement.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.buddyEvaluation?.areasForImprovement.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.buddyEvaluation?.wordsOfEncouragement.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.buddyEvaluation?.wordsOfEncouragement.answer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Buddy Evaluation</h3>
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-muted-foreground">
          This section has not been completed yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Buddy Evaluation</h3>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tasksParticipated" className="text-sm font-medium text-foreground">
              {_labelTexts.tasksParticipated}
            </Label>
            <SaveIndicator status={_getSaveStatus('tasksParticipated')} />
          </div>
          <Textarea
            id="tasksParticipated"
            value={tasksParticipated}
            onChange={(e) => _handleFieldChange('tasksParticipated', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Example: recreation, devotion, games, etc."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="strengths" className="text-sm font-medium text-foreground">
              {_labelTexts.strengths}
            </Label>
            <SaveIndicator status={_getSaveStatus('strengths')} />
          </div>
          <Textarea
            id="strengths"
            value={strengths}
            onChange={(e) => _handleFieldChange('strengths', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Provide examples where possible (e.g. willingness to learn, patience, spiritual maturity, etc.)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="areasForImprovement" className="text-sm font-medium text-foreground">
              {_labelTexts.areasForImprovement}
            </Label>
            <SaveIndicator status={_getSaveStatus('areasForImprovement')} />
          </div>
          <Textarea
            id="areasForImprovement"
            value={areasForImprovement}
            onChange={(e) => _handleFieldChange('areasForImprovement', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Please provide examples (e.g. discipline, punctuality, stepping out of comfort zone, etc.)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wordsOfEncouragement" className="text-sm font-medium text-foreground">
              {_labelTexts.wordsOfEncouragement}
            </Label>
            <SaveIndicator status={_getSaveStatus('wordsOfEncouragement')} />
          </div>
          <Textarea
            id="wordsOfEncouragement"
            value={wordsOfEncouragement}
            onChange={(e) => _handleFieldChange('wordsOfEncouragement', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Include advice or specific words of guidance or wisdom that will help their continued growth."
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
