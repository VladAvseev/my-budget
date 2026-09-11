import { api } from '@/shared/api/http';
import type { Category } from '@/shared/api/types/domain';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /categories/:id + оптимистичное удаление. */
const removeCategoryMutationKey = ['removeCategory'] as const;

/** Запрос DELETE /categories/:id — id категории. */
export type UseRemoveCategoryRequest = string;

/** Ответ DELETE /categories/:id — 204 без тела. */
export type UseRemoveCategoryResponse = void;

export const useRemoveCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeCategoryMutationKey,
    mutationFn: async (id: UseRemoveCategoryRequest) => {
      await api.del(`/categories/${id}`);
    },
    onMutate: async (id) => {
      const key = ['categories', userId];
      const previous = queryClient.getQueriesData<Category[]>({ queryKey: key });

      queryClient.setQueriesData<Category[]>({ queryKey: key }, (items) =>
        (items ?? []).filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
      invalidateHomeCaches(queryClient);
    },
  });
};
