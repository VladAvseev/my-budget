import { goalsQueryKey } from '@/shared/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /goals/:id + оптимистика. */
const removeGoalMutationKey = ['removeGoal'] as const;

export const useRemoveGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: removeGoalMutationKey,
    mutationFn: async (id: string) => {
      await api.del(`/goals/${id}`);
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];

      queryClient.setQueryData<Goal[]>(key, (items = []) => items.filter((item) => item.id !== id));

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
