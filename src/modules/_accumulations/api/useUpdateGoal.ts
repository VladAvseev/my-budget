import { goalsQueryKey } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleGoalMutation } from './cachePatches';

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
      const target = previous.find((item) => item.id === id) ?? null;

      queryClient.setQueryData<Goal[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                amount: input.amount,
                target_date: input.targetDate ?? null,
                _optimistic: true,
              } as Goal & OptimisticItem)
            : item,
        ),
      );

      return { previous, target };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
    },
    // Тихий settle: серверная цель замещает оптимистичную правку, bootstrap.goals —
    // upsert по categoryId. Refetch списка и bootstrap не нужен.
    onSuccess: (goal, _input, context) => {
      settleGoalMutation(queryClient, userId, {
        previous: context?.target ?? null,
        next: goal,
      });
    },
  });
};
