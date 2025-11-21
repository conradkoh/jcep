'use client';

import { EyeOff } from 'lucide-react';
import { useState } from 'react';
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
import type { AgeGroup, QuestionResponse, ReviewForm } from '../../types';
import { JC_REFLECTION_QUESTIONS } from './formQuestions';

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

export function JCReflectionSection({ form, canEdit, onUpdate }: JCReflectionSectionProps) {
  const [isEditing, setIsEditing] = useState(!form.jcReflection);
  const [isSaving, setIsSaving] = useState(false);

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

  const labelTexts = {
    nextRotationPreference: 'Next rotation preference',
    activitiesParticipated: 'Memorable activities',
    learningsFromJCEP: 'What you learned',
    whatToDoDifferently: 'What you would do differently',
    goalsForNextRotation: 'Goals & prayer needs',
  } as const;

  const handleSave = async () => {
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
          <Label htmlFor="activitiesParticipated" className="text-sm font-medium text-foreground">
            {labelTexts.activitiesParticipated}
          </Label>
          <Textarea
            id="activitiesParticipated"
            value={activitiesParticipated}
            onChange={(e) => setActivitiesParticipated(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share a few highlights from this rotation..."
          />
        </div>

        <div>
          <Label htmlFor="learningsFromJCEP" className="text-sm font-medium text-foreground">
            {labelTexts.learningsFromJCEP}
          </Label>
          <Textarea
            id="learningsFromJCEP"
            value={learningsFromJCEP}
            onChange={(e) => setLearningsFromJCEP(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="What did God teach you through JCEP?"
          />
        </div>

        <div>
          <Label htmlFor="whatToDoDifferently" className="text-sm font-medium text-foreground">
            {labelTexts.whatToDoDifferently}
          </Label>
          <Textarea
            id="whatToDoDifferently"
            value={whatToDoDifferently}
            onChange={(e) => setWhatToDoDifferently(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="If you could do this rotation again, what would you change?"
          />
        </div>

        <div>
          <Label htmlFor="goalsForNextRotation" className="text-sm font-medium text-foreground">
            {labelTexts.goalsForNextRotation}
          </Label>
          <Textarea
            id="goalsForNextRotation"
            value={goalsForNextRotation}
            onChange={(e) => setGoalsForNextRotation(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Share a few goals and prayer needs for your next rotation..."
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
