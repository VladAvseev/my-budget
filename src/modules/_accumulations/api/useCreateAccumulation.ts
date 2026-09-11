import { api } from '@/shared/api/http';
import type { Accumulation, AccumulationInput } from '@/shared/api/types/domain';
import { accumulationsTotalQueryKey, type AccumulationsTotal } from '@/shared/api/hooks';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createAccumulationMutationKey = ['createAccumulation'] as const;

export const useCreateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createAccumulationMutationKey,
    mutationFn: async (input: AccumulationInput) => {
      await api.post('/accumulations', {
        amount: input.amount,
        description: trimStrings(input.description),
        categoryId: input.categoryId ?? null,
      });
    },
    onMutate: async (input) => {
      const key = ['accumulations', userId];
      const totalKey = accumulationsTotalQueryKey(userId);
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];
      const previousTotal = queryClient.getQueryData<AccumulationsTotal>(totalKey);

      const now = new Date().toISOString();
      const optimistic: (typeof previous)[number] & OptimisticItem = {
        id: createOptimisticId(),
        user_id: userId,
        category_id: input.categoryId ?? null,
        description: input.description,
        amount: String(input.amount),
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);
      // Дельта и на кэшированную сумму: capital сайдбара берётся из total-ключа.
      const delta = Number(input.amount) || 0;
      if (delta !== 0) {
        queryClient.setQueryData<AccumulationsTotal>(totalKey, (prev) => ({
          total: (prev?.total ?? 0) + delta,
        }));
      }

      return { previous, previousTotal, patchedTotal: delta !== 0 };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      const totalKey = accumulationsTotalQueryKey(userId);
      queryClient.setQueryData(['accumulations', userId], context.previous);
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
