import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export const goalsQueryKey = (userId: string) => ['goals', userId] as const;

export type UseGoalsResponse = Goal[];

export const useGoals = (userId: string) =>
  useQuery<UseGoalsResponse>({
    queryKey: goalsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => (await api.get<UseGoalsResponse>('/goals', { signal })) ?? [],
  });
