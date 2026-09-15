import { goalsQueryKey } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseCreateGoalRequest {
  accountId: string;
  amount: number;
  targetDate?: string | null;
}
export type UseCreateGoalResponse = Goal;

export const useCreateGoal = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UseCreateGoalRequest) => api.post<UseCreateGoalResponse>('/goals', input),
    onSuccess: () => client.invalidateQueries({ queryKey: goalsQueryKey(userId) }),
  });
};
