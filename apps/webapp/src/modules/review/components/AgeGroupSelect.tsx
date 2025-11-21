'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AgeGroup } from '../types';

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
        <SelectItem value="RK">RK (Rainbows/Kindergarten)</SelectItem>
        <SelectItem value="DR">DR (Daisies/Reception)</SelectItem>
        <SelectItem value="AR">AR (Acorns/Reception)</SelectItem>
        <SelectItem value="ER">ER (Eagles/Reception)</SelectItem>
      </SelectContent>
    </Select>
  );
}
