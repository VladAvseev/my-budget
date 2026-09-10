import { api } from '@/shared/api/http';
import type { Accumulation, AccumulationInput } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** POST /accumulations + прежняя оптимистика. */
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
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];

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

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['accumulations', userId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accumulations', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSummary', userId] });
    },
  });
};
