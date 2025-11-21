'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AgeGroup } from '../types';
import { AGE_GROUP_LABELS } from '../utils/ageGroupLabels';

interface AgeGroupSelectProps {
  value: AgeGroup | '';
  onValueChange: (value: AgeGroup) => void;
  placeholder?: string;
  className?: string;
}

export function AgeGroupSelect({
  value,
  onValueChange,
  placeholder = 'Select age group',
  className,
}: AgeGroupSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as AgeGroup)}>
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
