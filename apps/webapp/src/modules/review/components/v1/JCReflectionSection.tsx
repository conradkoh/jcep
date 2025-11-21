'use client';

// Imports
import { EyeOff } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '../../hooks/useAutosave';
import type { AgeGroup, QuestionResponse, ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { validatePayload } from '../../utils/autosaveHelpers';
import { AgeGroupSelect } from '../AgeGroupSelect';
import { JC_REFLECTION_QUESTIONS } from './formQuestions';
import { SaveIndicator } from './SaveIndicator';

// Public interfaces and types
/**
 * Props for the JCReflectionSection component.
 * Handles the Junior Commander's reflection on their rotation experience with autosave functionality.
 *
 * @example
 * ```typescript
 * <JCReflectionSection
 *   form={reviewForm}
 *   canEdit={true}
 *   onUpdate={async (data) => {
 *     await updateJCReflection({ formId, ...data });
 *   }}
 * />
 * ```
 */
export interface JCReflectionSectionProps {
  /** The review form containing JC reflection data */
  form: ReviewForm;
  /** Whether the current user can edit this section */
  canEdit: boolean;
  /** Callback function called when reflection data is updated */
  onUpdate: (data: {
    nextRotationPreference: AgeGroup;
    activitiesParticipated: QuestionResponse;
    learningsFromJCEP: QuestionResponse;
    whatToDoDifferently: QuestionResponse;
    goalsForNextRotation: QuestionResponse;
  }) => Promise<void>;
}

/**
 * Field names available in the JC reflection section (excluding nextRotationPreference which is handled separately).
 */
export type FieldName =
  | 'activitiesParticipated'
  | 'learningsFromJCEP'
  | 'whatToDoDifferently'
  | 'goalsForNextRotation';

// Internal types
type _SaveStatus = 'saved' | 'modified' | 'none';

interface _FieldData {
  activitiesParticipated: string;
  learningsFromJCEP: string;
  whatToDoDifferently: string;
  goalsForNextRotation: string;
}

// Exported component
/**
 * JC Reflection section component with autosave functionality.
 * Allows Junior Commanders to reflect on their rotation experience and set preferences for their next rotation.
 * Changes are automatically saved after 1.5 seconds of inactivity.
 */
export function JCReflectionSection({ form, canEdit, onUpdate }: JCReflectionSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.jcReflection);

  const [nextRotationPreference, setNextRotationPreference] = useState<AgeGroup>(
    form.nextRotationPreference || 'RK'
  );
  const [activitiesParticipated, setActivitiesParticipated] = useState(
    form.jcReflection?.activitiesParticipated.answer || ''
  );
  const [learningsFromJCEP, setLearningsFromJCEP] = useState(
    form.jcReflection?.learningsFromJCEP.answer || ''
  );
  const [whatToDoDifferently, setWhatToDoDifferently] = useState(
    form.jcReflection?.whatToDoDifferently.answer || ''
  );
  const [goalsForNextRotation, setGoalsForNextRotation] = useState(
    form.jcReflection?.goalsForNextRotation.answer || ''
  );

  // Use refs to always get current state values (for autosave closures)
  const activitiesParticipatedRef = useRef(activitiesParticipated);
  const learningsFromJCEPRef = useRef(learningsFromJCEP);
  const whatToDoDifferentlyRef = useRef(whatToDoDifferently);
  const goalsForNextRotationRef = useRef(goalsForNextRotation);

  // Keep refs in sync with state
  activitiesParticipatedRef.current = activitiesParticipated;
  learningsFromJCEPRef.current = learningsFromJCEP;
  whatToDoDifferentlyRef.current = whatToDoDifferently;
  goalsForNextRotationRef.current = goalsForNextRotation;

  // Track which fields are currently being saved
  const [savingFields, setSavingFields] = useState<Set<FieldName>>(new Set());
  const [nextRotationPreferenceSaving, setNextRotationPreferenceSaving] = useState(false);

  const _labelTexts = useMemo(
    () => ({
      nextRotationPreference: 'Where would you like to go for your next rotation?',
      activitiesParticipated: JC_REFLECTION_QUESTIONS.activitiesParticipated,
      learningsFromJCEP: JC_REFLECTION_QUESTIONS.learningsFromJCEP,
      whatToDoDifferently: JC_REFLECTION_QUESTIONS.whatToDoDifferently,
      goalsForNextRotation: JC_REFLECTION_QUESTIONS.goalsForNextRotation,
    }),
    []
  );

  // Autosave function for a specific field
  const _createFieldSaveFn = useCallback(
    (field: FieldName) => async (data: _FieldData) => {
      const payload = {
        nextRotationPreference,
        activitiesParticipated: {
          questionText: JC_REFLECTION_QUESTIONS.activitiesParticipated,
          answer: data.activitiesParticipated,
        },
        learningsFromJCEP: {
          questionText: JC_REFLECTION_QUESTIONS.learningsFromJCEP,
          answer: data.learningsFromJCEP,
        },
        whatToDoDifferently: {
          questionText: JC_REFLECTION_QUESTIONS.whatToDoDifferently,
          answer: data.whatToDoDifferently,
        },
        goalsForNextRotation: {
          questionText: JC_REFLECTION_QUESTIONS.goalsForNextRotation,
          answer: data.goalsForNextRotation,
        },
      };

      // Validate payload in development
      validatePayload(
        payload,
        [
          'nextRotationPreference',
          'activitiesParticipated',
          'learningsFromJCEP',
          'whatToDoDifferently',
          'goalsForNextRotation',
        ],
        `JCReflectionSection ${field} autosave`
      );

      await onUpdate(payload);

      // Clear this field from saving state after successful save
      setSavingFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    },
    [onUpdate, nextRotationPreference]
  );

  // Create separate autosave instances for each field
  const activitiesParticipatedAutosave = useAutosave(
    _createFieldSaveFn('activitiesParticipated'),
    1500
  );
  const learningsFromJCEPAutosave = useAutosave(_createFieldSaveFn('learningsFromJCEP'), 1500);
  const whatToDoDifferentlyAutosave = useAutosave(_createFieldSaveFn('whatToDoDifferently'), 1500);
  const goalsForNextRotationAutosave = useAutosave(
    _createFieldSaveFn('goalsForNextRotation'),
    1500
  );

  const _nextRotationPreferenceAutosave = useAutosave(
    useCallback(
      async (preference: AgeGroup) => {
        const payload = {
          nextRotationPreference: preference,
          activitiesParticipated: {
            questionText: JC_REFLECTION_QUESTIONS.activitiesParticipated,
            answer: activitiesParticipatedRef.current,
          },
          learningsFromJCEP: {
            questionText: JC_REFLECTION_QUESTIONS.learningsFromJCEP,
            answer: learningsFromJCEPRef.current,
          },
          whatToDoDifferently: {
            questionText: JC_REFLECTION_QUESTIONS.whatToDoDifferently,
            answer: whatToDoDifferentlyRef.current,
          },
          goalsForNextRotation: {
            questionText: JC_REFLECTION_QUESTIONS.goalsForNextRotation,
            answer: goalsForNextRotationRef.current,
          },
        };

        // Validate payload in development
        validatePayload(
          payload,
          [
            'nextRotationPreference',
            'activitiesParticipated',
            'learningsFromJCEP',
            'whatToDoDifferently',
            'goalsForNextRotation',
          ],
          'JCReflectionSection nextRotationPreference autosave'
        );

        await onUpdate(payload);
        setNextRotationPreferenceSaving(false);
      },
      [onUpdate]
    ),
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
      const data: _FieldData = {
        activitiesParticipated,
        learningsFromJCEP,
        whatToDoDifferently,
        goalsForNextRotation,
      };

      switch (field) {
        case 'activitiesParticipated':
          setActivitiesParticipated(value);
          activitiesParticipatedAutosave.debouncedSave({ ...data, activitiesParticipated: value });
          break;
        case 'learningsFromJCEP':
          setLearningsFromJCEP(value);
          learningsFromJCEPAutosave.debouncedSave({ ...data, learningsFromJCEP: value });
          break;
        case 'whatToDoDifferently':
          setWhatToDoDifferently(value);
          whatToDoDifferentlyAutosave.debouncedSave({ ...data, whatToDoDifferently: value });
          break;
        case 'goalsForNextRotation':
          setGoalsForNextRotation(value);
          goalsForNextRotationAutosave.debouncedSave({ ...data, goalsForNextRotation: value });
          break;
      }
    },
    [
      activitiesParticipated,
      learningsFromJCEP,
      whatToDoDifferently,
      goalsForNextRotation,
      activitiesParticipatedAutosave,
      learningsFromJCEPAutosave,
      whatToDoDifferentlyAutosave,
      goalsForNextRotationAutosave,
    ]
  );

  const isComplete = form.jcReflection !== null;

  const _isSaving = useMemo(
    () =>
      activitiesParticipatedAutosave.isSaving ||
      learningsFromJCEPAutosave.isSaving ||
      whatToDoDifferentlyAutosave.isSaving ||
      goalsForNextRotationAutosave.isSaving,
    [
      activitiesParticipatedAutosave.isSaving,
      learningsFromJCEPAutosave.isSaving,
      whatToDoDifferentlyAutosave.isSaving,
      goalsForNextRotationAutosave.isSaving,
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
        (field === 'activitiesParticipated' && activitiesParticipatedAutosave.isSaving) ||
        (field === 'learningsFromJCEP' && learningsFromJCEPAutosave.isSaving) ||
        (field === 'whatToDoDifferently' && whatToDoDifferentlyAutosave.isSaving) ||
        (field === 'goalsForNextRotation' && goalsForNextRotationAutosave.isSaving);

      // If field is in saving state (modified and debouncing/saving)
      if (savingFields.has(field) || isFieldSaving) return 'modified';

      // If field has been saved at least once (form exists)
      if (form.jcReflection && !savingFields.has(field)) return 'saved';

      return 'none';
    },
    [
      activitiesParticipatedAutosave.isSaving,
      learningsFromJCEPAutosave.isSaving,
      whatToDoDifferentlyAutosave.isSaving,
      goalsForNextRotationAutosave.isSaving,
      savingFields,
      form.jcReflection,
    ]
  );

  // V2: Show hidden message if responses are not visible
  if (!form.jcReflection && !canEdit) {
    return (
      <Alert>
        <EyeOff className="h-4 w-4" />
        <AlertTitle>Responses Hidden</AlertTitle>
        <AlertDescription>
          The Junior Commander's reflection is currently hidden by the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isEditing && isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Junior Commander Reflection</h3>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcReflection?.activitiesParticipated.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcReflection?.activitiesParticipated.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcReflection?.learningsFromJCEP.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcReflection?.learningsFromJCEP.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcReflection?.whatToDoDifferently.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcReflection?.whatToDoDifferently.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {form.jcReflection?.goalsForNextRotation.questionText}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {form.jcReflection?.goalsForNextRotation.answer}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Next Rotation Preference
            </Label>
            <p className="mt-1 text-foreground">
              {form.nextRotationPreference
                ? getAgeGroupLabel(form.nextRotationPreference)
                : 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Junior Commander Reflection</h3>
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-muted-foreground">
          This section has not been completed yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Junior Commander Reflection</h3>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="activitiesParticipated" className="text-sm font-medium text-foreground">
              {_labelTexts.activitiesParticipated}
            </Label>
            <SaveIndicator status={_getSaveStatus('activitiesParticipated')} />
          </div>
          <Textarea
            id="activitiesParticipated"
            value={activitiesParticipated}
            onChange={(e) => _handleFieldChange('activitiesParticipated', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Explain why these activities were memorable or impactful to you."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="learningsFromJCEP" className="text-sm font-medium text-foreground">
              {_labelTexts.learningsFromJCEP}
            </Label>
            <SaveIndicator status={_getSaveStatus('learningsFromJCEP')} />
          </div>
          <Textarea
            id="learningsFromJCEP"
            value={learningsFromJCEP}
            onChange={(e) => _handleFieldChange('learningsFromJCEP', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Include details from devotions or prayer life and how these impacted your ministry."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="whatToDoDifferently" className="text-sm font-medium text-foreground">
              {_labelTexts.whatToDoDifferently}
            </Label>
            <SaveIndicator status={_getSaveStatus('whatToDoDifferently')} />
          </div>
          <Textarea
            id="whatToDoDifferently"
            value={whatToDoDifferently}
            onChange={(e) => _handleFieldChange('whatToDoDifferently', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="If you could do this rotation again, what would you change?"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="goalsForNextRotation" className="text-sm font-medium text-foreground">
              {_labelTexts.goalsForNextRotation}
            </Label>
            <SaveIndicator status={_getSaveStatus('goalsForNextRotation')} />
          </div>
          <Textarea
            id="goalsForNextRotation"
            value={goalsForNextRotation}
            onChange={(e) => _handleFieldChange('goalsForNextRotation', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share a few goals and prayer needs for your next rotation..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="nextRotationPreference" className="text-sm font-medium text-foreground">
              {_labelTexts.nextRotationPreference}
            </Label>
            <SaveIndicator
              status={
                nextRotationPreferenceSaving || _nextRotationPreferenceAutosave.isSaving
                  ? 'modified'
                  : form.jcReflection && form.nextRotationPreference
                    ? 'saved'
                    : 'none'
              }
            />
          </div>
          <AgeGroupSelect
            value={nextRotationPreference}
            onValueChange={(value) => {
              setNextRotationPreference(value);
              // Mark as saving and trigger autosave when dropdown value changes
              setNextRotationPreferenceSaving(true);
              _nextRotationPreferenceAutosave.debouncedSave(value);
            }}
            placeholder="Select preferred age group"
            className="mt-1"
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
