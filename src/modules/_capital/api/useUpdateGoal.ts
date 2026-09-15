import { goalsQueryKey } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseUpdateGoalRequest {
  id: string;
  input: { amount: number; targetDate: string | null };
}
export type UseUpdateGoalResponse = Goal;

export const useUpdateGoal = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: UseUpdateGoalRequest) =>
      api.patch<UseUpdateGoalResponse>(`/goals/${id}`, input),
    onSuccess: () => client.invalidateQueries({ queryKey: goalsQueryKey(userId) }),
  });
};
