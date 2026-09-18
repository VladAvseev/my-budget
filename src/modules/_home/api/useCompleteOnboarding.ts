import { api, updateStoredSessionUser } from '@/shared/api/http';
import type { ApiUser } from '@/shared/api/http';
import { bootstrapQueryKey, type UseBootstrapResponse } from '@/shared/api/hooks';
import { toProfile } from '@/shared/api/profileMapper';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UseCompleteOnboardingRequest = void;

export type UseCompleteOnboardingResponse = ApiUser;

interface UpdateProfileBody {
  onboarded: boolean;
}

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const body: UpdateProfileBody = { onboarded: true };
      return api.patch<UseCompleteOnboardingResponse>('/users/me', body);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', updated.id], toProfile(updated));
      updateStoredSessionUser(updated);
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      queryClient.setQueryData<UseBootstrapResponse>(bootstrapQueryKey, (prev) =>
        prev ? { ...prev, profile: { ...prev.profile, onboarded: true } } : prev,
      );
    },
  });
};
