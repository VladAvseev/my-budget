import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Завершение онбординга: PATCH /users/me { onboarded: true }
 * (порт RPC complete_onboarding).
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch('/users/me', { onboarded: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
