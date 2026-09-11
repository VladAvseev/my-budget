import { api } from '@/shared/api/http';
import type { ApiUser } from '@/shared/api/http';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /users/me { startBalance }:
 * стартовый баланс для глобальной сводки.
 */

/** Запрос — новое значение стартового баланса. */
export type UseUpdateStartBalanceRequest = number;

/** Ответ PATCH /users/me — обновлённый публичный профиль (200). */
export type UseUpdateStartBalanceResponse = ApiUser;

/** Тело на проводе (серверный UpdateProfileInput). */
interface UpdateProfileBody {
  startBalance: number;
}

export const useUpdateStartBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startBalance: UseUpdateStartBalanceRequest) => {
      const body: UpdateProfileBody = { startBalance };
      return api.patch<UseUpdateStartBalanceResponse>('/users/me', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      invalidateHomeCaches(queryClient);
    },
  });
};
