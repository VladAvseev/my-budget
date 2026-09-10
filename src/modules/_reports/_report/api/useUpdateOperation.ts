import { api } from '@/shared/api/http';
import type { Operation, OperationUpdateInput } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /operations/:id. Отправляем только реально
 * заполненные поля: null в amount смысл иметь не может (NOT NULL), а
 * categoryId/description = null — легальное «очистить».
 */
const updateOperationMutationKey = ['updateOperation'] as const;

export const useUpdateOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateOperationMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: OperationUpdateInput }) => {
      const body: Record<string, unknown> = {};
      if (input.amount !== undefined && input.amount !== null) body.amount = input.amount;
      if (input.categoryId !== undefined) body.categoryId = input.categoryId;
      if (input.description !== undefined) body.description = trimStrings(input.description);
      if (input.type !== undefined) body.type = input.type;
      if (input.date !== undefined) body.date = input.date;
      await api.patch(`/operations/${id}`, body);
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
