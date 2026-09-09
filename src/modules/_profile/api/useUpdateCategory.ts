import { api } from '@/shared/api/http';
import type { Category, CategoryUpdateInput } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /categories/:id (порт update_category). Отправляем только реально
 * переданные поля — серверный PATCH-whitelist не затирает остальное null'ами.
 */
const updateCategoryMutationKey = ['updateCategory'] as const;

export const useUpdateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateCategoryMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: CategoryUpdateInput }) => {
      const body: Record<string, unknown> = {};
      if (input.name !== undefined) body.name = trimStrings(input.name);
      if (input.color !== undefined) body.color = input.color;
      await api.patch(`/categories/${id}`, body);
    },
    onMutate: async ({ id, input }) => {
      const key = ['categories', userId];
      const previous = queryClient.getQueriesData<Category[]>({ queryKey: key });

      queryClient.setQueriesData<Category[]>({ queryKey: key }, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.color !== undefined ? { color: input.color } : {}),
                _optimistic: true,
              } as Category & OptimisticItem)
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });
};
