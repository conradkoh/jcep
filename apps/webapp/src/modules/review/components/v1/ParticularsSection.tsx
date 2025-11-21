'use client';

import { Pencil1Icon } from '@radix-ui/react-icons';
import { CalendarIcon, Check, X } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AgeGroup, ReviewForm } from '../../types';
import { getAgeGroupLabel } from '../../utils/ageGroupLabels';
import { formatRotationLabel, getRotationQuarterOptions } from '../../utils/rotationUtils';
import { AgeGroupSelect } from '../AgeGroupSelect';

interface ParticularsSectionProps {
  form: ReviewForm;
  canEdit: boolean;
  onUpdate: (updates: {
    rotationYear?: number;
    rotationQuarter?: number;
    buddyName?: string;
    juniorCommanderName?: string;
    ageGroup?: AgeGroup;
    evaluationDate?: number;
  }) => Promise<void>;
  buddyName: string;
  juniorCommanderName: string;
  ageGroup: AgeGroup;
  isSubmitted: boolean;
}

type EditableField =
  | 'rotationYear'
  | 'rotationQuarter'
  | 'buddyName'
  | 'juniorCommanderName'
  | 'ageGroup'
  | 'evaluationDate'
  | null;

export function ParticularsSection({
  form,
  canEdit,
  onUpdate,
  buddyName: buddyNameProp,
  juniorCommanderName: juniorCommanderNameProp,
  ageGroup: ageGroupProp,
  isSubmitted,
}: ParticularsSectionProps) {
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [rotationYear, setRotationYear] = useState(form.rotationYear);
  const [rotationQuarter, setRotationQuarter] = useState(form.rotationQuarter);
  const [buddyName, setBuddyName] = useState(form.buddyName);
  const [jcName, setJcName] = useState(form.juniorCommanderName);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(form.ageGroup);
  const [evaluationDate, setEvaluationDate] = useState(new Date(form.evaluationDate));
  const [isSaving, setIsSaving] = useState(false);

  // Enable editing if form exists and is not submitted (fallback check)
  const isEditable = canEdit || (!isSubmitted && form.status !== 'submitted');

  const formatDate = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toFormat('dd MMM yyyy');
  };

  const handleFieldSave = async (field: EditableField) => {
    if (!field) return;

    setIsSaving(true);
    try {
      const updates: Parameters<typeof onUpdate>[0] = {};

      switch (field) {
        case 'rotationYear':
          // Save both rotation year and quarter together
          updates.rotationYear = rotationYear;
          updates.rotationQuarter = rotationQuarter;
          break;
        case 'rotationQuarter':
          // Save both rotation year and quarter together
          updates.rotationYear = rotationYear;
          updates.rotationQuarter = rotationQuarter;
          break;
        case 'buddyName':
          updates.buddyName = buddyName;
          break;
        case 'juniorCommanderName':
          updates.juniorCommanderName = jcName;
          break;
        case 'ageGroup':
          updates.ageGroup = ageGroup;
          break;
        case 'evaluationDate':
          updates.evaluationDate = evaluationDate.getTime();
          break;
      }

      await onUpdate(updates);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldCancel = (field: EditableField) => {
    if (!field) return;

    // Reset to original form values
    switch (field) {
      case 'rotationYear':
        setRotationYear(form.rotationYear);
        break;
      case 'rotationQuarter':
        setRotationQuarter(form.rotationQuarter);
        break;
      case 'buddyName':
        setBuddyName(form.buddyName);
        break;
      case 'juniorCommanderName':
        setJcName(form.juniorCommanderName);
        break;
      case 'ageGroup':
        setAgeGroup(form.ageGroup);
        break;
      case 'evaluationDate':
        setEvaluationDate(new Date(form.evaluationDate));
        break;
    }
    setEditingField(null);
  };

  const startEditing = (field: EditableField) => {
    if (!isEditable || isSubmitted) return;
    setEditingField(field);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Review Form - {formatRotationLabel(form.rotationYear, form.rotationQuarter)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {buddyNameProp} & {juniorCommanderNameProp} ({getAgeGroupLabel(ageGroupProp)})
          </p>
        </div>
        {isSubmitted && (
          <div className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400">
            Submitted
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-card p-3 text-sm md:grid-cols-5">
        {/* Rotation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Rotation</p>
            {editingField === 'rotationYear' || editingField === 'rotationQuarter' ? (
              <div className="mt-1 space-y-2">
                <Input
                  type="number"
                  value={rotationYear}
                  onChange={(e) => setRotationYear(Number.parseInt(e.target.value) || 0)}
                  min={2020}
                  max={2100}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Select
                  value={String(rotationQuarter)}
                  onValueChange={(value) => setRotationQuarter(Number.parseInt(value))}
                >
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getRotationQuarterOptions().map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldSave('rotationYear')}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldCancel('rotationYear')}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium text-foreground">
                {formatRotationLabel(form.rotationYear, form.rotationQuarter)}
              </p>
            )}
          </div>
          {isEditable && editingField !== 'rotationYear' && editingField !== 'rotationQuarter' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground self-center"
              onClick={() => startEditing('rotationYear')}
            >
              <Pencil1Icon className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Buddy */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Buddy</p>
            {editingField === 'buddyName' ? (
              <div className="mt-1 space-y-2">
                <Input
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldSave('buddyName')}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldCancel('buddyName')}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium text-foreground">{form.buddyName}</p>
            )}
          </div>
          {isEditable && editingField !== 'buddyName' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground self-center"
              onClick={() => startEditing('buddyName')}
            >
              <Pencil1Icon className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Junior Commander */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Junior Commander</p>
            {editingField === 'juniorCommanderName' ? (
              <div className="mt-1 space-y-2">
                <Input
                  value={jcName}
                  onChange={(e) => setJcName(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldSave('juniorCommanderName')}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldCancel('juniorCommanderName')}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium text-foreground">{form.juniorCommanderName}</p>
            )}
          </div>
          {isEditable && editingField !== 'juniorCommanderName' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground self-center"
              onClick={() => startEditing('juniorCommanderName')}
            >
              <Pencil1Icon className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Age Group */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Age Group</p>
            {editingField === 'ageGroup' ? (
              <div className="mt-1 space-y-2">
                <AgeGroupSelect
                  value={ageGroup}
                  onValueChange={setAgeGroup}
                  className="h-7 text-sm"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldSave('ageGroup')}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldCancel('ageGroup')}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium text-foreground">{getAgeGroupLabel(form.ageGroup)}</p>
            )}
          </div>
          {isEditable && editingField !== 'ageGroup' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground self-center"
              onClick={() => startEditing('ageGroup')}
            >
              <Pencil1Icon className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Evaluation Date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Evaluation Date</p>
            {editingField === 'evaluationDate' ? (
              <div className="mt-1 space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-7 w-full justify-start text-left text-sm font-normal',
                        !evaluationDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {evaluationDate ? (
                        formatDate(evaluationDate.getTime())
                      ) : (
                        <span>Pick a date</span>
                      )}
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
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldSave('evaluationDate')}
                    disabled={isSaving}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleFieldCancel('evaluationDate')}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium text-foreground">{formatDate(form.evaluationDate)}</p>
            )}
          </div>
          {isEditable && editingField !== 'evaluationDate' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground self-center"
              onClick={() => startEditing('evaluationDate')}
            >
              <Pencil1Icon className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
