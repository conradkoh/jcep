import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';

export function useCandidateBatches(isAdmin: boolean) {
  const batches = useSessionQuery(
    api.programmeAdministration.listCandidateBatches,
    isAdmin ? {} : 'skip'
  );
  return { batches, isLoading: batches === undefined };
}

export function useCandidatesByBatch(birthYear: number | null, isAdmin: boolean) {
  const candidates = useSessionQuery(
    api.programmeAdministration.listCandidatesByBatch,
    isAdmin && birthYear !== null ? { birthYear } : 'skip'
  );
  return { candidates, isLoading: candidates === undefined };
}
