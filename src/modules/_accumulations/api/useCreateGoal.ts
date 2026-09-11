import { goalsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** POST /goals: 400 чужая/не savings категория, 409 дубль. */
const createGoalMutationKey = ['createGoal'] as const;

/** Запрос POST /goals — payload модалки (прежний GoalInput). */
export interface UseCreateGoalRequest {
  categoryId: string;
  amount: number;
  targetDate?: string | null;
}

/** Ответ POST /goals — созданная цель (201). */
export type UseCreateGoalResponse = Goal;

/** Тело на проводе (серверный CreateGoalInput). */
interface CreateGoalBody {
  categoryId: string;
  amount: number;
  targetDate: string | null;
}

export const useCreateGoal = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createGoalMutationKey,
    mutationFn: async (input: UseCreateGoalRequest) => {
      const body: CreateGoalBody = {
        categoryId: input.categoryId,
        amount: input.amount,
        targetDate: input.targetDate ?? null,
      };
      return api.post<UseCreateGoalResponse>('/goals', body);
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
        target_date: input.targetDate ?? null,
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
      invalidateHomeCaches(queryClient);
    },
  });
};
