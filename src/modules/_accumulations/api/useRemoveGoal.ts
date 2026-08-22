import { goalsQueryKey } from '@/shared/hooks';
import { supabase } from '@/shared/supabase/supabase';
import type { Goal } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeGoalMutationKey = ['removeGoal'] as const;

export const useRemoveGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: removeGoalMutationKey,
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_goal', { p_id: id });
      if (error) throw error;
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];

      queryClient.setQueryData<Goal[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });
};
