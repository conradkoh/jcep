'use client';

import { CalendarIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { AgeGroup, ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { formatRotationLabel } from '../../utils/rotationUtils';
import { AgeGroupSelect } from '../AgeGroupSelect';

interface ParticularsSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (updates: {
    buddyName?: string;
    juniorCommanderName?: string;
    ageGroup?: AgeGroup;
    evaluationDate?: number;
  }) => Promise<void>;
  rotationYear: number;
  buddyName: string;
  juniorCommanderName: string;
  ageGroup: AgeGroup;
  isComplete: boolean;
  isSubmitted: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function ParticularsSection({
  form,
  canEdit,
  onUpdate,
  rotationYear,
  buddyName: buddyNameProp,
  juniorCommanderName: juniorCommanderNameProp,
  ageGroup: ageGroupProp,
  isComplete,
  isSubmitted,
  canSubmit,
  onSubmit,
}: ParticularsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [buddyName, setBuddyName] = useState(form.buddyName);
  const [jcName, setJcName] = useState(form.juniorCommanderName);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(form.ageGroup);
  const [evaluationDate, setEvaluationDate] = useState(new Date(form.evaluationDate));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        buddyName,
        juniorCommanderName: jcName,
        ageGroup,
        evaluationDate: evaluationDate.getTime(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update particulars:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBuddyName(form.buddyName);
    setJcName(form.juniorCommanderName);
    setAgeGroup(form.ageGroup);
    setEvaluationDate(new Date(form.evaluationDate));
    setIsEditing(false);
  };

  const formatDate = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Review Form - {formatRotationLabel(rotationYear, form.rotationQuarter)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {buddyNameProp} & {juniorCommanderNameProp} ({getAgeGroupLabel(ageGroupProp)})
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isComplete && !isSubmitted && canSubmit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Submit Form</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Review Form?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will submit your review form and change its status from "In Progress" to
                      "Submitted". Once submitted, you will not be able to make further edits.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>Submit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isSubmitted && (
              <div className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400">
                Submitted
              </div>
            )}
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-card p-3 text-sm md:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">Rotation</p>
            <p className="font-medium text-foreground">
              {formatRotationLabel(form.rotationYear, form.rotationQuarter)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Buddy</p>
            <p className="font-medium text-foreground">{form.buddyName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Junior Commander</p>
            <p className="font-medium text-foreground">{form.juniorCommanderName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Age Group</p>
            <p className="font-medium text-foreground">{getAgeGroupLabel(form.ageGroup)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Evaluation Date</p>
            <p className="font-medium text-foreground">{formatDate(form.evaluationDate)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Particulars</h3>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
        <div>
          <Label className="text-sm font-medium text-foreground">Rotation Year</Label>
          <p className="text-sm text-muted-foreground">{form.rotationYear}</p>
        </div>

        <div>
          <Label htmlFor="buddyName" className="text-sm font-medium text-foreground">
            Buddy Name
          </Label>
          <Input
            id="buddyName"
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="jcName" className="text-sm font-medium text-foreground">
            Junior Commander Name
          </Label>
          <Input
            id="jcName"
            value={jcName}
            onChange={(e) => setJcName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ageGroup" className="text-sm font-medium text-foreground">
            Age Group
          </Label>
          <AgeGroupSelect
            value={ageGroup}
            onValueChange={setAgeGroup}
            placeholder="Select age group"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground">Evaluation Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'mt-1 w-full justify-start text-left font-normal',
                  !evaluationDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {evaluationDate ? formatDate(evaluationDate.getTime()) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={evaluationDate}
                onSelect={(date) => date && setEvaluationDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
