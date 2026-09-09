import { goalsQueryKey } from '@/shared/hooks';
import { api } from '@/shared/api/http';
import type { Goal, GoalUpdateInput } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** PATCH /goals/:id (порт update_goal): сумма и/или целевая дата. */
const updateGoalMutationKey = ['updateGoal'] as const;

export const useUpdateGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: updateGoalMutationKey,
    mutationFn: async ({ id, input }: { id: string; input: GoalUpdateInput }) => {
      await api.patch(`/goals/${id}`, {
        amount: input.amount,
        targetDate: input.targetDate ?? null,
      });
    },
    onMutate: async ({ id, input }) => {
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];

      queryClient.setQueryData<Goal[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                amount: String(input.amount),
                target_date: input.targetDate ?? null,
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
