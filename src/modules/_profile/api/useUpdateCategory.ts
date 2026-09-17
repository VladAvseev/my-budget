import { api } from '@/shared/api/http';
import type { Category } from '@/shared/api/types/domain';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateCategoryMutationKey = ['updateCategory'] as const;

export interface UseUpdateCategoryRequest {
  id: string;
  input: {
    name?: string;
    color?: string | null;
  };
}

export type UseUpdateCategoryResponse = Category;

interface UpdateCategoryBody {
  name?: string;
  color?: string | null;
}

export const useUpdateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateCategoryMutationKey,
    mutationFn: async ({ id, input }: UseUpdateCategoryRequest) => {
      const body: UpdateCategoryBody = {};
      if (input.name !== undefined) body.name = trimStrings(input.name);
      if (input.color !== undefined) body.color = input.color;
      return api.patch<UseUpdateCategoryResponse>(`/categories/${id}`, body);
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
      invalidateHomeCaches(queryClient);
    },
  });
};
