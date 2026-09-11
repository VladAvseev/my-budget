import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import {
  accumulationsQueryKey,
  accumulationsTotalQueryKey,
  type AccumulationsTotal,
} from '@/shared/api/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleAccumulationMutation } from './cachePatches';

const removeAccumulationMutationKey = ['removeAccumulation'] as const;

/** Запрос DELETE /accumulations/:id — id накопления. */
export type UseRemoveAccumulationRequest = string;

/** Ответ DELETE /accumulations/:id — 204 без тела. */
export type UseRemoveAccumulationResponse = void;

export const useRemoveAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = accumulationsQueryKey(userId);
  const totalKey = accumulationsTotalQueryKey(userId);

  return useMutation({
    mutationKey: removeAccumulationMutationKey,
    mutationFn: async (id: UseRemoveAccumulationRequest) => {
      await api.del(`/accumulations/${id}`);
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];
      const previousTotal = queryClient.getQueryData<AccumulationsTotal>(totalKey);
      const target = previous.find((item) => item.id === id) ?? null;
      const delta = -(Number(target?.amount) || 0);

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      if (delta !== 0) {
        queryClient.setQueryData<AccumulationsTotal>(totalKey, (prev) => ({
          total: (prev?.total ?? 0) + delta,
        }));
      }

      return { previous, previousTotal, patchedTotal: delta !== 0, target };
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
    // Тихий settle: удаление уже отражено в оптимистике — остаётся убрать
    // строку из bootstrap-дельты (onMutate bootstrap не трогает, только total).
    onSuccess: (_data, _id, context) => {
      settleAccumulationMutation(queryClient, userId, {
        previous: context?.target ?? null,
        next: null,
      });
    },
  });
};
