import { supabase } from '@/shared/supabase/supabase';
import type { Category, CategoryUpdateInput } from '@/shared/supabase/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateCategoryMutationKey = ['updateCategory'] as const;

export const useUpdateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateCategoryMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: CategoryUpdateInput }) => {
      const { error } = await supabase.rpc('update_category', {
        p_id: id,
        p_name: input.name !== undefined ? trimStrings(input.name) : null,
        p_color: input.color ?? null,
      });
      if (error) throw error;
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