import { api } from '@/shared/api/http';
import type { Goal } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /goals: цели; user — из токена, userId только для ключа кэша. */
export const goalsQueryKey = (userId: string) => ['goals', userId] as const;

export const useGoals = (userId: string) =>
  useQuery<Goal[]>({
    queryKey: goalsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => (await api.get<Goal[]>('/goals', { signal })) ?? [],
  });
