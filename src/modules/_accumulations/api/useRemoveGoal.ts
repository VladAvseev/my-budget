import { goalsQueryKey } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleGoalMutation } from './cachePatches';

/** DELETE /goals/:id + оптимистика. */
const removeGoalMutationKey = ['removeGoal'] as const;

/** Запрос DELETE /goals/:id — id цели. */
export type UseRemoveGoalRequest = string;

/** Ответ DELETE /goals/:id — 204 без тела. */
export type UseRemoveGoalResponse = void;

export const useRemoveGoal = (userId: string) => {
  const queryClient = useQueryClient();
  const key = goalsQueryKey(userId);

  return useMutation({
    mutationKey: removeGoalMutationKey,
    mutationFn: async (id: UseRemoveGoalRequest) => {
      await api.del(`/goals/${id}`);
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Goal[]>(key) ?? [];
      const target = previous.find((item) => item.id === id) ?? null;

      queryClient.setQueryData<Goal[]>(key, (items = []) => items.filter((item) => item.id !== id));

      return { previous, target };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
    },
    // Тихий settle: список уже почищен оптимистикой, остаётся снять цель из
    // bootstrap.goals по categoryId удалённой строки. Refetch не нужен.
    onSuccess: (_data, _id, context) => {
      settleGoalMutation(queryClient, userId, {
        previous: context?.target ?? null,
        next: null,
      });
    },
  });
};
