'use client';

import { EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export function BuddyEvaluationSection({ form, canEdit, onUpdate }: BuddyEvaluationSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.buddyEvaluation);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        tasksParticipated: {
          questionText: BUDDY_EVALUATION_QUESTIONS.tasksParticipated,
          answer: tasksParticipated,
        },
        strengths: {
          questionText: BUDDY_EVALUATION_QUESTIONS.strengths,
          answer: strengths,
        },
        areasForImprovement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.areasForImprovement,
          answer: areasForImprovement,
        },
        wordsOfEncouragement: {
          questionText: BUDDY_EVALUATION_QUESTIONS.wordsOfEncouragement,
          answer: wordsOfEncouragement,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update buddy evaluation:', error);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Buddy Evaluation</h3>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <Label htmlFor="tasksParticipated" className="text-sm font-medium text-foreground">
            {BUDDY_EVALUATION_QUESTIONS.tasksParticipated}
          </Label>
          <Textarea
            id="tasksParticipated"
            value={tasksParticipated}
            onChange={(e) => setTasksParticipated(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Describe the tasks and activities..."
          />
        </div>

        <div>
          <Label htmlFor="strengths" className="text-sm font-medium text-foreground">
            {BUDDY_EVALUATION_QUESTIONS.strengths}
          </Label>
          <Textarea
            id="strengths"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Highlight their strengths and achievements..."
          />
        </div>

        <div>
          <Label htmlFor="areasForImprovement" className="text-sm font-medium text-foreground">
            {BUDDY_EVALUATION_QUESTIONS.areasForImprovement}
          </Label>
          <Textarea
            id="areasForImprovement"
            value={areasForImprovement}
            onChange={(e) => setAreasForImprovement(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Provide constructive feedback with examples..."
          />
        </div>

        <div>
          <Label htmlFor="wordsOfEncouragement" className="text-sm font-medium text-foreground">
            {BUDDY_EVALUATION_QUESTIONS.wordsOfEncouragement}
          </Label>
          <Textarea
            id="wordsOfEncouragement"
            value={wordsOfEncouragement}
            onChange={(e) => setWordsOfEncouragement(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share words of encouragement..."
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
