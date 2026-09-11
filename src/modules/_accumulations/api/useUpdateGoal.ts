import { goalsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** PATCH /goals/:id: сумма и/или целевая дата. */
const updateGoalMutationKey = ['updateGoal'] as const;

/** Запрос PATCH /goals/:id — id + payload модалки (прежний GoalUpdateInput). */
export interface UseUpdateGoalRequest {
  id: string;
  input: {
    amount: number;
    targetDate?: string | null;
  };
}

/** Ответ PATCH /goals/:id — обновлённая цель (200). */
export type UseUpdateGoalResponse = Goal;

/** Тело на проводе (серверный UpdateGoalInput). */
interface UpdateGoalBody {
  amount?: number;
  targetDate?: string | null;
}

export const useUpdateGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: updateGoalMutationKey,
    mutationFn: async ({ id, input }: UseUpdateGoalRequest) => {
      const body: UpdateGoalBody = {
        amount: input.amount,
        targetDate: input.targetDate ?? null,
      };
      return api.patch<UseUpdateGoalResponse>(`/goals/${id}`, body);
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
      invalidateHomeCaches(queryClient);
    },
  });
};
