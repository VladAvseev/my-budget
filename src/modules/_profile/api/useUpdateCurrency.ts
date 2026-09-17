import { api } from '@/shared/api/http';
import type { ApiUser } from '@/shared/api/http';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UseUpdateCurrencyRequest = string | null;

export type UseUpdateCurrencyResponse = ApiUser;

interface UpdateProfileBody {
  currency: string | null;
}

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: UseUpdateCurrencyRequest) => {
      const body: UpdateProfileBody = { currency };
      return api.patch<UseUpdateCurrencyResponse>('/users/me', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      invalidateHomeCaches(queryClient);
    },
  });
};
