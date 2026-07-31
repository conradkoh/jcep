import type { AgeGroup } from '@/modules/jcep/types';

export interface ProgrammeCandidate {
  id: string;
  fullName: string;
  birthYear: number;
  contactNumber?: string;
  ageGroup?: AgeGroup;
}
