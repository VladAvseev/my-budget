import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /operations/:id + оптимистичное удаление. */
const removeOperationMutationKey = ['removeOperation'] as const;

/** Запрос DELETE /operations/:id — id операции. */
export type UseRemoveOperationRequest = string;

/** Ответ DELETE /operations/:id — 204 без тела. */
export type UseRemoveOperationResponse = void;

export const useRemoveOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeOperationMutationKey,
    mutationFn: async (id: UseRemoveOperationRequest) => {
      await api.del(`/operations/${id}`);
    },
    onMutate: async (id) => {
      const prefix = ['reports', reportId, 'operations'];
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      const removed = previous
        .flatMap(([, items]) => items ?? [])
        .find((item) => item.id === id);
      const summaryPrevious = removed
        ? applySummaryDelta(queryClient, reportId, {
            remove: { type: removed.type, amount: Number(removed.amount) || 0 },
          })
        : undefined;

      queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items) =>
        (items ?? []).filter((item) => item.id !== id),
      );

      return { previous, summaryPrevious };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        }
      }
      restoreSummary(queryClient, reportId, context.summaryPrevious);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
