import { api } from '@/shared/api/http';
import type { Accumulation, AccumulationUpdateInput } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /accumulations/:id (порт update_accumulation). Отсылаем только
 * переданные поля — null в amount сервер не примет, и это правильно.
 */
const updateAccumulationMutationKey = ['updateAccumulation'] as const;

export const useUpdateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: updateAccumulationMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: AccumulationUpdateInput }) => {
      const body: Record<string, unknown> = {};
      if (input.amount !== undefined) body.amount = input.amount;
      if (input.description !== undefined) body.description = trimStrings(input.description);
      if (input.categoryId !== undefined) body.categoryId = input.categoryId;
      await api.patch(`/accumulations/${id}`, body);
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
