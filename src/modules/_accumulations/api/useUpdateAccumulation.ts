import { supabase } from '@/shared/supabase/supabase';
import type { Accumulation, AccumulationUpdateInput } from '@/shared/supabase/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateAccumulationMutationKey = ['updateAccumulation'] as const;

export const useUpdateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: updateAccumulationMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: AccumulationUpdateInput }) => {
      const { error } = await supabase.rpc('update_accumulation', {
        p_id: id,
        p_amount: input.amount ?? null,
        p_description: input.description !== undefined ? trimStrings(input.description) : null,
        p_category_id: input.categoryId ?? null,
      });
      if (error) throw error;
    },
    onMutate: async ({ id, input }) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.amount !== undefined ? { amount: String(input.amount) } : {}),
                ...(input.description !== undefined
                  ? { description: trimStrings(input.description) }
                  : {}),
                ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
                _optimistic: true,
              } as Accumulation & OptimisticItem)
            : item,
        ),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accumulations', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSummary', userId] });
    },
  });
};