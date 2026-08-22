import { goalsQueryKey } from '@/shared/hooks';
import { supabase } from '@/shared/supabase/supabase';
import type { Goal, GoalInput } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createGoalMutationKey = ['createGoal'] as const;

export const useCreateGoal = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createGoalMutationKey,
    mutationFn: async (input: GoalInput) => {
      const { error } = await supabase.rpc('create_goal', {
        p_category_id: input.categoryId,
        p_amount: input.amount,
      });
      if (error) throw error;
    },
    onMutate: async (input) => {
      const key = goalsQueryKey(userId);
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];

      const now = new Date().toISOString();
      const optimistic: (typeof previous)[number] & OptimisticItem = {
        id: createOptimisticId(),
        user_id: userId,
        category_id: input.categoryId,
        amount: String(input.amount),
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [...previous, optimistic]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(goalsQueryKey(userId), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });
};
