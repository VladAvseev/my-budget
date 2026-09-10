import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * DELETE /reports/:id/daily-expenses:
 * сервер одной транзакцией удаляет daily-операции и сбрасывает настройки.
 */
export const useDisableDailyExpenses = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
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
