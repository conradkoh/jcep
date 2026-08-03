'use client';

import { UNASSIGNED_AGE_GROUP, type AgeGroup, type RosterApplicant } from '../types';

import { Badge } from '@/components/ui/badge';
import { DataListField, DataListItem, DataListItemHeader } from '@/components/ui/data-list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

interface RotationRosterListItemProps {
  applicant: RosterApplicant;
  selectValue: string;
  isUpdating: boolean;
  onAgeGroupChange: (applicant: RosterApplicant, value: string) => void;
}

export function RotationRosterListItem({
  applicant,
  selectValue,
  isUpdating,
  onAgeGroupChange,
}: RotationRosterListItemProps) {
  const isAssigned = applicant.ageGroupOnRotation !== null;

  return (
    <DataListItem className={isAssigned ? 'bg-primary/5' : undefined}>
      <DataListItemHeader title={applicant.fullName} />
      <DataListField label="Contact">{applicant.contactNumber}</DataListField>
      <DataListField label="App Preference">
        <Badge variant="outline">{getAgeGroupLabel(applicant.ageGroupChoice1)}</Badge>
      </DataListField>
      <DataListField
        label="Assignment"
        className="flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      >
        <Select
          value={selectValue}
          onValueChange={(value) => value !== null && onAgeGroupChange(applicant, value)}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_AGE_GROUP}>Unassigned</SelectItem>
            {(['RK', 'DR', 'AR', 'ER'] as AgeGroup[]).map((ag) => (
              <SelectItem key={ag} value={ag}>
                {getAgeGroupLabel(ag)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataListField>
    </DataListItem>
  );
}
