import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * DELETE /reports/:id/daily-expenses:
 * сервер одной транзакцией удаляет daily-операции и сбрасывает настройки.
 */

/** Запроса нет (id — из хука,variables = undefined). */
export type UseDisableDailyExpensesRequest = void;

/** Ответ DELETE /reports/:id/daily-expenses — 204 без тела. */
export type UseDisableDailyExpensesResponse = void;

export const useDisableDailyExpenses = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<UseDisableDailyExpensesResponse, Error, UseDisableDailyExpensesRequest>({
    mutationFn: async () => {
      await api.del(`/reports/${id}/daily-expenses`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'operations'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'operations'] });
    },
  });
};
