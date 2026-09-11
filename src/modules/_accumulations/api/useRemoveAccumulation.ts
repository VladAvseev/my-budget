import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import { accumulationsTotalQueryKey, type AccumulationsTotal } from '@/shared/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeAccumulationMutationKey = ['removeAccumulation'] as const;

export const useRemoveAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];
  const totalKey = accumulationsTotalQueryKey(userId);

  return useMutation({
    mutationKey: removeAccumulationMutationKey,
    mutationFn: async (id: string) => {
      await api.del(`/accumulations/${id}`);
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];
      const previousTotal = queryClient.getQueryData<AccumulationsTotal>(totalKey);
      const delta = -(Number(previous.find((item) => item.id === id)?.amount) || 0);

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      if (delta !== 0) {
        queryClient.setQueryData<AccumulationsTotal>(totalKey, (prev) => ({
          total: (prev?.total ?? 0) + delta,
        }));
      }

      return { previous, previousTotal, patchedTotal: delta !== 0 };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
      if (!context.patchedTotal) return;
      if (context.previousTotal === undefined) {
        queryClient.removeQueries({ queryKey: totalKey, exact: true });
      } else {
        queryClient.setQueryData(totalKey, context.previousTotal);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accumulations', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSummary', userId] });
    },
  });
};
