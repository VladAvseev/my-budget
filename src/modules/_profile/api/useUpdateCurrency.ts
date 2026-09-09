import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /users/me { currency } (порт update_currency): смена валюты профиля.
 */
export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: string | null) => {
      await api.patch('/users/me', { currency });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
