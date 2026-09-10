import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /operations/:id + оптимистичное удаление. */
const removeOperationMutationKey = ['removeOperation'] as const;

export const useRemoveOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeOperationMutationKey,
    mutationFn: async (id: string) => {
      await api.del(`/operations/${id}`);
    },
    onMutate: async (id) => {
      const prefix = ['reports', reportId, 'operations'];
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items) =>
        (items ?? []).filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        }
      }
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
