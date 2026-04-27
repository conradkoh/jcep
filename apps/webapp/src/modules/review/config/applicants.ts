import type { AgeGroup } from '../types';

export type Applicant = {
  name: string;
  ageGroup: AgeGroup;
  displayGroup: string;
};

export const APPLICANTS: readonly Applicant[] = [
  { name: 'Abigail Moi', ageGroup: 'RK', displayGroup: 'RK' },
  { name: 'Clarissa', ageGroup: 'DR', displayGroup: 'DR' },
  { name: 'Joylynn Teo', ageGroup: 'AR', displayGroup: 'ARG' },
  { name: 'Xide', ageGroup: 'AR', displayGroup: 'ARB' },
  { name: 'Joel Lee', ageGroup: 'ER', displayGroup: 'ER' },
] as const;
