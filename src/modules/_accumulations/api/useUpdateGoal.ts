import { goalsQueryKey } from '@/shared/hooks';
import { supabase } from '@/shared/supabase/supabase';
import type { Goal, GoalUpdateInput } from '@/shared/supabase/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateGoalMutationKey = ['updateGoal'] as const;

export const useUpdateGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: updateGoalMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: GoalUpdateInput }) => {
      const { error } = await supabase.rpc('update_goal', {
        p_id: id,
        p_amount: input.amount,
      });
      if (error) throw error;
    },
    onMutate: async ({ id, input }) => {
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];

      queryClient.setQueryData<Goal[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                amount: String(input.amount),
                _optimistic: true,
              } as Goal & OptimisticItem)
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
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });
};
