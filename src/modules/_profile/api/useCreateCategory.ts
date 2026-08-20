import { supabase } from '@/shared/supabase/supabase';
import type { Category, CategoryCreateInput } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { categoriesQueryKey } from './keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createCategoryMutationKey = ['createCategory'] as const;

export const useCreateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createCategoryMutationKey,
    mutationFn: async (input: CategoryCreateInput) => {
      const { error } = await supabase.rpc('create_category', {
        p_type: input.type,
        p_name: trimStrings(input.name),
        p_color: input.color ?? null,
      });
      if (error) throw error;
    },
    onMutate: async (input) => {
      const allKey = categoriesQueryKey(userId);
      const typeKey = categoriesQueryKey(userId, input.type);
      const prevAll = queryClient.getQueryData<Category[]>(allKey) ?? [];
      const prevType = queryClient.getQueryData<Category[]>(typeKey) ?? [];

      const now = new Date().toISOString();
      const optimistic: Category & OptimisticItem = {
        id: createOptimisticId(),
        user_id: userId,
        type: input.type,
        name: input.name,
        color: input.color ?? null,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData<Category[]>(allKey, [...prevAll, optimistic]);
      queryClient.setQueryData<Category[]>(typeKey, [...prevType, optimistic]);

      return { allKey, typeKey, prevAll, prevType };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(context.allKey, context.prevAll);
      queryClient.setQueryData(context.typeKey, context.prevType);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};