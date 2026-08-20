import { supabase } from '@/shared/supabase/supabase';
import type { Accumulation, AccumulationInput } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createAccumulationMutationKey = ['createAccumulation'] as const;

export const useCreateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createAccumulationMutationKey,
    mutationFn: async (input: AccumulationInput) => {
      const { error } = await supabase.rpc('create_accumulation', {
        p_amount: input.amount,
        p_description: trimStrings(input.description),
        p_category_id: input.categoryId ?? null,
      });
      if (error) throw error;
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
    },
  });
};