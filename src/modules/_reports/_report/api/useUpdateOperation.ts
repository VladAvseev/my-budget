import { supabase } from '@/shared/supabase/supabase';
import type { Operation, OperationUpdateInput } from '@/shared/supabase/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateOperationMutationKey = ['updateOperation'] as const;

export const useUpdateOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateOperationMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: OperationUpdateInput }) => {
      const { error } = await supabase.rpc('update_operation', {
        p_id: id,
        p_amount: input.amount ?? null,
        p_category_id: input.categoryId ?? null,
        p_description: input.description ?? null,
        p_type: input.type ?? null,
        p_date: input.date ?? null,
      });
      if (error) throw error;
    },
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
                ...(input.description !== undefined
                  ? { description: trimStrings(input.description) }
                  : {}),
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