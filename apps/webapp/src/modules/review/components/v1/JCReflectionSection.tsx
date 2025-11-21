'use client';

import { EyeOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '../../hooks/useAutosave';
import type { AgeGroup, QuestionResponse, ReviewForm } from '../../types';
import { JC_REFLECTION_QUESTIONS } from './formQuestions';
import { SaveIndicator } from './SaveIndicator';

interface JCReflectionSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (data: {
    nextRotationPreference: AgeGroup;
    activitiesParticipated: QuestionResponse;
    learningsFromJCEP: QuestionResponse;
    whatToDoDifferently: QuestionResponse;
    goalsForNextRotation: QuestionResponse;
  }) => Promise<void>;
}

type FieldName =
  | 'activitiesParticipated'
  | 'learningsFromJCEP'
  | 'whatToDoDifferently'
  | 'goalsForNextRotation';

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

  // Track which fields are currently being saved
  const [savingFields, setSavingFields] = useState<Set<FieldName>>(new Set());

  const labelTexts = {
    nextRotationPreference: 'Next rotation preference',
    activitiesParticipated: 'Memorable activities',
    learningsFromJCEP: 'What you learned',
    whatToDoDifferently: 'What you would do differently',
    goalsForNextRotation: 'Goals & prayer needs',
  } as const;

  // Autosave function for a specific field
  const createFieldSaveFn = useCallback(
    (field: FieldName) =>
      async (data: {
        activitiesParticipated: string;
        learningsFromJCEP: string;
        whatToDoDifferently: string;
        goalsForNextRotation: string;
      }) => {
        await onUpdate({
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
        });
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
    createFieldSaveFn('activitiesParticipated'),
    1500
  );
  const learningsFromJCEPAutosave = useAutosave(createFieldSaveFn('learningsFromJCEP'), 1500);
  const whatToDoDifferentlyAutosave = useAutosave(createFieldSaveFn('whatToDoDifferently'), 1500);
  const goalsForNextRotationAutosave = useAutosave(createFieldSaveFn('goalsForNextRotation'), 1500);

  const handleSave = async () => {
    try {
      await onUpdate({
        nextRotationPreference,
        activitiesParticipated: {
          questionText: JC_REFLECTION_QUESTIONS.activitiesParticipated,
          answer: activitiesParticipated,
        },
        learningsFromJCEP: {
          questionText: JC_REFLECTION_QUESTIONS.learningsFromJCEP,
          answer: learningsFromJCEP,
        },
        whatToDoDifferently: {
          questionText: JC_REFLECTION_QUESTIONS.whatToDoDifferently,
          answer: whatToDoDifferently,
        },
        goalsForNextRotation: {
          questionText: JC_REFLECTION_QUESTIONS.goalsForNextRotation,
          answer: goalsForNextRotation,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update JC reflection:', error);
    }
  };

  const handleFieldChange = (field: FieldName, value: string) => {
    // Mark field as being saved
    setSavingFields((prev) => new Set(prev).add(field));

    // Update state and trigger field-specific autosave
    const data = {
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
  };

  const handleCancel = () => {
    setNextRotationPreference(form.nextRotationPreference || 'RK');
    setActivitiesParticipated(form.jcReflection?.activitiesParticipated.answer || '');
    setLearningsFromJCEP(form.jcReflection?.learningsFromJCEP.answer || '');
    setWhatToDoDifferently(form.jcReflection?.whatToDoDifferently.answer || '');
    setGoalsForNextRotation(form.jcReflection?.goalsForNextRotation.answer || '');
    setIsEditing(false);
  };

  const getSaveStatus = (field: FieldName): 'saved' | 'modified' | 'none' => {
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
  };

  const isComplete = form.jcReflection !== null;

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
              Next Rotation Preference
            </Label>
            <p className="mt-1 text-foreground">{form.nextRotationPreference}</p>
          </div>

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
          <Label htmlFor="nextRotationPreference" className="text-sm font-medium text-foreground">
            {labelTexts.nextRotationPreference}
          </Label>
          <Select
            value={nextRotationPreference}
            onValueChange={(value) => setNextRotationPreference(value as AgeGroup)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select preferred age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RK">RK (Rainbows/Kindergarten)</SelectItem>
              <SelectItem value="DR">DR (Daisies/Reception)</SelectItem>
              <SelectItem value="AR">AR (Acorns/Reception)</SelectItem>
              <SelectItem value="ER">ER (Eagles/Reception)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="activitiesParticipated" className="text-sm font-medium text-foreground">
              {labelTexts.activitiesParticipated}
            </Label>
            <SaveIndicator status={getSaveStatus('activitiesParticipated')} />
          </div>
          <Textarea
            id="activitiesParticipated"
            value={activitiesParticipated}
            onChange={(e) => handleFieldChange('activitiesParticipated', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share a few highlights from this rotation..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="learningsFromJCEP" className="text-sm font-medium text-foreground">
              {labelTexts.learningsFromJCEP}
            </Label>
            <SaveIndicator status={getSaveStatus('learningsFromJCEP')} />
          </div>
          <Textarea
            id="learningsFromJCEP"
            value={learningsFromJCEP}
            onChange={(e) => handleFieldChange('learningsFromJCEP', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="What did God teach you through JCEP?"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="whatToDoDifferently" className="text-sm font-medium text-foreground">
              {labelTexts.whatToDoDifferently}
            </Label>
            <SaveIndicator status={getSaveStatus('whatToDoDifferently')} />
          </div>
          <Textarea
            id="whatToDoDifferently"
            value={whatToDoDifferently}
            onChange={(e) => handleFieldChange('whatToDoDifferently', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="If you could do this rotation again, what would you change?"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="goalsForNextRotation" className="text-sm font-medium text-foreground">
              {labelTexts.goalsForNextRotation}
            </Label>
            <SaveIndicator status={getSaveStatus('goalsForNextRotation')} />
          </div>
          <Textarea
            id="goalsForNextRotation"
            value={goalsForNextRotation}
            onChange={(e) => handleFieldChange('goalsForNextRotation', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share a few goals and prayer needs for your next rotation..."
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={
              activitiesParticipatedAutosave.isSaving ||
              learningsFromJCEPAutosave.isSaving ||
              whatToDoDifferentlyAutosave.isSaving ||
              goalsForNextRotationAutosave.isSaving
            }
          >
            {activitiesParticipatedAutosave.isSaving ||
            learningsFromJCEPAutosave.isSaving ||
            whatToDoDifferentlyAutosave.isSaving ||
            goalsForNextRotationAutosave.isSaving
              ? 'Saving...'
              : 'Save'}
          </Button>
          {isComplete && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={
                activitiesParticipatedAutosave.isSaving ||
                learningsFromJCEPAutosave.isSaving ||
                whatToDoDifferentlyAutosave.isSaving ||
                goalsForNextRotationAutosave.isSaving
              }
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
