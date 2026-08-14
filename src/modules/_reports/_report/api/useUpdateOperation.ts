import {
  operationsService,
  type Operation,
  type OperationUpdateInput,
} from '@/shared/supabase/services/operations';
import { type OptimisticItem } from '@/shared/optimistic';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateOperationMutationKey = ['updateOperation'] as const;

export const useUpdateOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateOperationMutationKey,
    mutationFn: ({ id, input }: { id: string; input: OperationUpdateInput }) =>
      operationsService.updateOperation(id, input),
    onMutate: async ({ id, input }) => {
      const prefix = ['reports', reportId, 'operations'];
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.type !== undefined ? { type: input.type } : {}),
                ...(input.amount !== undefined ? { amount: String(input.amount) } : {}),
                ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
                ...(input.description !== undefined ? { description: input.description } : {}),
                ...(input.date !== undefined ? { date: input.date } : {}),
                _optimistic: true,
              } as Operation & OptimisticItem)
            : item,
        ),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
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