'use client';

import { Check, Circle, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '../../hooks/useAutosave';
import type { QuestionResponse, ReviewForm } from '../../types';
import { BUDDY_EVALUATION_QUESTIONS } from './formQuestions';

interface BuddyEvaluationSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (data: {
    tasksParticipated: QuestionResponse;
    strengths: QuestionResponse;
    areasForImprovement: QuestionResponse;
    wordsOfEncouragement: QuestionResponse;
  }) => Promise<void>;
}

type FieldName = 'tasksParticipated' | 'strengths' | 'areasForImprovement' | 'wordsOfEncouragement';

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

  // Track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState<Set<FieldName>>(new Set());

  const labelTexts = {
    tasksParticipated: 'Tasks they participated in',
    strengths: "Junior Commander's strengths",
    areasForImprovement: 'Areas for improvement',
    wordsOfEncouragement: 'Words of encouragement',
  } as const;

  // Autosave function
  const saveFn = useCallback(
    async (data: {
      tasksParticipated: string;
      strengths: string;
      areasForImprovement: string;
      wordsOfEncouragement: string;
    }) => {
      await onUpdate({
        tasksParticipated: {
          questionText: BUDDY_EVALUATION_QUESTIONS.tasksParticipated,
          answer: data.tasksParticipated,
        },
        strengths: {
          questionText: BUDDY_EVALUATION_QUESTIONS.strengths,
          answer: data.strengths,
        },
        areasForImprovement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.areasForImprovement,
          answer: data.areasForImprovement,
        },
        wordsOfEncouragement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.wordsOfEncouragement,
          answer: data.wordsOfEncouragement,
        },
      });
    },
    [onUpdate]
  );

  const { debouncedSave, isSaving } = useAutosave(saveFn, 1500);

  // Clear modified fields when save completes
  useEffect(() => {
    if (!isSaving && modifiedFields.size > 0) {
      setModifiedFields(new Set());
    }
  }, [isSaving, modifiedFields.size]);

  const handleSave = async () => {
    try {
      await saveFn({ tasksParticipated, strengths, areasForImprovement, wordsOfEncouragement });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update buddy evaluation:', error);
    }
  };

  const handleFieldChange = (field: FieldName, value: string) => {
    // Mark field as modified
    setModifiedFields((prev) => new Set(prev).add(field));

    // Update state based on field
    switch (field) {
      case 'tasksParticipated':
        setTasksParticipated(value);
        debouncedSave({
          tasksParticipated: value,
          strengths,
          areasForImprovement,
          wordsOfEncouragement,
        });
        break;
      case 'strengths':
        setStrengths(value);
        debouncedSave({
          tasksParticipated,
          strengths: value,
          areasForImprovement,
          wordsOfEncouragement,
        });
        break;
      case 'areasForImprovement':
        setAreasForImprovement(value);
        debouncedSave({
          tasksParticipated,
          strengths,
          areasForImprovement: value,
          wordsOfEncouragement,
        });
        break;
      case 'wordsOfEncouragement':
        setWordsOfEncouragement(value);
        debouncedSave({
          tasksParticipated,
          strengths,
          areasForImprovement,
          wordsOfEncouragement: value,
        });
        break;
    }
  };

  const handleCancel = () => {
    setTasksParticipated(form.buddyEvaluation?.tasksParticipated.answer || '');
    setStrengths(form.buddyEvaluation?.strengths.answer || '');
    setAreasForImprovement(form.buddyEvaluation?.areasForImprovement.answer || '');
    setWordsOfEncouragement(form.buddyEvaluation?.wordsOfEncouragement.answer || '');
    setIsEditing(false);
  };

  const isComplete = form.buddyEvaluation !== null;

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

  const getSaveStatus = (field: FieldName): 'saved' | 'modified' | 'none' => {
    if (isSaving && modifiedFields.has(field)) return 'modified';
    if (!isSaving && !modifiedFields.has(field) && form.buddyEvaluation) return 'saved';
    return 'none';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Buddy Evaluation</h3>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tasksParticipated" className="text-sm font-medium text-foreground">
              {labelTexts.tasksParticipated}
            </Label>
            <SaveIndicator status={getSaveStatus('tasksParticipated')} />
          </div>
          <Textarea
            id="tasksParticipated"
            value={tasksParticipated}
            onChange={(e) => handleFieldChange('tasksParticipated', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="List key tasks and activities..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="strengths" className="text-sm font-medium text-foreground">
              {labelTexts.strengths}
            </Label>
            <SaveIndicator status={getSaveStatus('strengths')} />
          </div>
          <Textarea
            id="strengths"
            value={strengths}
            onChange={(e) => handleFieldChange('strengths', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share where they did well..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="areasForImprovement" className="text-sm font-medium text-foreground">
              {labelTexts.areasForImprovement}
            </Label>
            <SaveIndicator status={getSaveStatus('areasForImprovement')} />
          </div>
          <Textarea
            id="areasForImprovement"
            value={areasForImprovement}
            onChange={(e) => handleFieldChange('areasForImprovement', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Suggest what could be better next time..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wordsOfEncouragement" className="text-sm font-medium text-foreground">
              {labelTexts.wordsOfEncouragement}
            </Label>
            <SaveIndicator status={getSaveStatus('wordsOfEncouragement')} />
          </div>
          <Textarea
            id="wordsOfEncouragement"
            value={wordsOfEncouragement}
            onChange={(e) => handleFieldChange('wordsOfEncouragement', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Encourage and affirm them..."
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

function SaveIndicator({ status }: { status: 'saved' | 'modified' | 'none' }) {
  if (status === 'none') return null;

  if (status === 'modified') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <Circle className="h-3 w-3 fill-current" />
        <span>Modified</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
      <Check className="h-3 w-3" />
      <span>Saved</span>
    </div>
  );
}
