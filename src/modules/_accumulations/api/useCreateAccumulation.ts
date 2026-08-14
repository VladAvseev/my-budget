import {
  accumulationsService,
  type Accumulation,
  type AccumulationInput,
} from '@/shared/supabase/services/accumulations';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createAccumulationMutationKey = ['createAccumulation'] as const;

export const useCreateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createAccumulationMutationKey,
    mutationFn: (input: AccumulationInput) => accumulationsService.createAccumulation(userId, input),
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
    },
  });
};