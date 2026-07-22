'use client';

import type { AgeGroup } from '../types';
import { AGE_GROUP_LABELS } from '../utils/ageGroupLabels';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgeGroupSelectProps {
  value: AgeGroup | '';
  onValueChange: (value: AgeGroup) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AgeGroupSelect({
  value,
  onValueChange,
  placeholder = 'Select age group',
  className,
  disabled,
}: AgeGroupSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as AgeGroup)} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="RK">{AGE_GROUP_LABELS.RK}</SelectItem>
        <SelectItem value="DR">{AGE_GROUP_LABELS.DR}</SelectItem>
        <SelectItem value="AR">{AGE_GROUP_LABELS.AR}</SelectItem>
        <SelectItem value="ER">{AGE_GROUP_LABELS.ER}</SelectItem>
      </SelectContent>
    </Select>
  );
}
