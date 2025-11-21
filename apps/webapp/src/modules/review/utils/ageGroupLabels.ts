/**
 * Age group label utilities
 */

import type { AgeGroup } from '../types';

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  RK: 'Ranger Kids',
  DR: 'Discovery Rangers',
  AR: 'Adventure Rangers',
  ER: 'Expedition Rangers',
};

export function getAgeGroupLabel(ageGroup: AgeGroup): string {
  return AGE_GROUP_LABELS[ageGroup];
}
