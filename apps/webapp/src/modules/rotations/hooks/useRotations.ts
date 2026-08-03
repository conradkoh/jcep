import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';

export function useListRotations(isAdmin: boolean) {
  const rotations = useSessionQuery(api.rotations.listRotations, isAdmin ? {} : 'skip');
  return { rotations, isLoading: rotations === undefined };
}

export function useRotationWithParticipants(rotationId: Id<'rotations'> | null, isAdmin: boolean) {
  const data = useSessionQuery(
    api.rotations.getRotationWithParticipants,
    isAdmin && rotationId ? { rotationId } : 'skip'
  );
  return { data, isLoading: data === undefined };
}

export function useRotationRoster(rotationId: Id<'rotations'> | null, isAdmin: boolean) {
  const data = useSessionQuery(
    api.rotations.getRotationRoster,
    isAdmin && rotationId ? { rotationId } : 'skip'
  );
  return { data, isLoading: data === undefined };
}

export function useCreateRotation() {
  return useSessionMutation(api.rotations.createRotation);
}

export function useUpdateRotation() {
  return useSessionMutation(api.rotations.updateRotation);
}

export function useDeleteRotation() {
  return useSessionMutation(api.rotations.deleteRotation);
}

export function useAddParticipant() {
  return useSessionMutation(api.rotations.addParticipant);
}

export function useRemoveParticipant() {
  return useSessionMutation(api.rotations.removeParticipant);
}

export function useSetApplicantAssignment() {
  return useSessionMutation(api.rotations.setApplicantAssignment);
}

export function useSetRotationParticipantAgeGroup() {
  return useSessionMutation(api.rotations.setRotationParticipantAgeGroup);
}

export function useRotationYearOverview(year: number, isAdmin: boolean) {
  const data = useSessionQuery(api.rotations.getRotationYearOverview, isAdmin ? { year } : 'skip');
  return { data, isLoading: data === undefined };
}

export function useLinkReviewFormToParticipant() {
  return useSessionMutation(api.rotations.linkReviewFormToParticipant);
}

export function useSearchApplicants(
  searchTerm: string,
  rotationId: Id<'rotations'> | undefined,
  isAdmin: boolean
) {
  const results = useSessionQuery(
    api.rotations.searchApplicants,
    isAdmin && searchTerm.trim().length >= 2 && rotationId ? { searchTerm, rotationId } : 'skip'
  );
  return { results, isLoading: results === undefined };
}
