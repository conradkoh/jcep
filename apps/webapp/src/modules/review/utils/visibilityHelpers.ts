import type { ReviewForm } from '../types';

export interface CombinedVisibilityState {
  isVisible: boolean;
  isMismatched: boolean;
  buddyVisible: boolean;
  jcVisible: boolean;
}

export function getCombinedVisibilityState(form: ReviewForm): CombinedVisibilityState {
  const bothVisible = form.buddyResponsesVisibleToJC && form.jcResponsesVisibleToBuddy;
  const bothHidden = !form.buddyResponsesVisibleToJC && !form.jcResponsesVisibleToBuddy;
  const mismatched = !bothVisible && !bothHidden;

  return {
    isVisible: bothVisible || mismatched,
    isMismatched: mismatched,
    buddyVisible: form.buddyResponsesVisibleToJC,
    jcVisible: form.jcResponsesVisibleToBuddy,
  };
}
