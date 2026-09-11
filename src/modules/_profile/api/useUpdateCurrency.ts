import { api } from '@/shared/api/http';
import type { ApiUser } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /users/me { currency }: смена валюты профиля.
 */

/** Запрос — код валюты или null (сброс). */
export type UseUpdateCurrencyRequest = string | null;

/** Ответ PATCH /users/me — обновлённый публичный профиль (200). */
export type UseUpdateCurrencyResponse = ApiUser;

/** Тело на проводе (серверный UpdateProfileInput). */
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
    },
  });
};
