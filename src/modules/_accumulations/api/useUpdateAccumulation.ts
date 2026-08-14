import {
  accumulationsService,
  type Accumulation,
  type AccumulationUpdateInput,
} from '@/shared/supabase/services/accumulations';
import { type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateAccumulationMutationKey = ['updateAccumulation'] as const;

export const useUpdateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: updateAccumulationMutationKey,
    mutationFn: ({ id, input }: { id: string; input: AccumulationUpdateInput }) =>
      accumulationsService.updateAccumulation(id, input),
    onMutate: async ({ id, input }) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.amount !== undefined ? { amount: String(input.amount) } : {}),
                ...(input.description !== undefined ? { description: input.description } : {}),
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
    },
  });
};