import { goalsQueryKey } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UseRemoveGoalRequest = string;
export type UseRemoveGoalResponse = void;

export const useRemoveGoal = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: UseRemoveGoalRequest) => api.del<UseRemoveGoalResponse>(`/goals/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: goalsQueryKey(userId) }),
  });
};
