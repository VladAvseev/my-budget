import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /users/me { startBalance }:
 * стартовый баланс для глобальной сводки.
 */
export const useUpdateStartBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startBalance: number) => {
      await api.patch('/users/me', { startBalance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
    },
  });
};
