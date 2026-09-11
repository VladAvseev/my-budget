import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export const accumulationsQueryKey = (userId: string) => ['accumulations', userId] as const;

export const accumulationsTotalQueryKey = (userId: string) =>
  ['accumulations', userId, 'total'] as const;

export interface AccumulationsTotal {
  total: number;
}

export const useAccumulations = (userId: string) =>
  useQuery<Accumulation[]>({
    queryKey: accumulationsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<Accumulation[]>('/accumulations', { signal })) ?? [],
  });

export const useAccumulationsTotal = (userId: string) => {
  const query = useQuery<AccumulationsTotal>({
    queryKey: accumulationsTotalQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<AccumulationsTotal>('/accumulations/total', { signal })) ?? { total: 0 },
  });

  return { total: query.data?.total ?? 0, ...query };
};
