import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /reports/:id (порт delete_report) + оптимистичное удаление из списка. */
const removeReportMutationKey = ['removeReport'] as const;

export const useRemoveReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeReportMutationKey,
    mutationFn: async () => {
      await api.del(`/reports/${id}`);
    },
    onMutate: async () => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      queryClient.setQueryData<Report[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'operations'] });
    },
  });
};
