import { supabase } from '@/shared/supabase/supabase';
import type { Category } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeCategoryMutationKey = ['removeCategory'] as const;

export const useRemoveCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeCategoryMutationKey,
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_category', { p_id: id });
      if (error) throw error;
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
    },
  });
};