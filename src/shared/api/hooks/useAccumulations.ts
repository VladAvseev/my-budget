import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export const accumulationsQueryKey = (userId: string) => ['accumulations', userId] as const;

export const accumulationsTotalQueryKey = (userId: string) =>
  ['accumulations', userId, 'total'] as const;

/** Ответ GET /accumulations/total (серверный AccumulationsTotal). */
export interface AccumulationsTotal {
  total: number;
}

/** Ответ GET /accumulations — список накоплений пользователя (user из JWT). */
export type UseAccumulationsResponse = Accumulation[];

/** Ответ GET /accumulations/total. */
export type UseAccumulationsTotalResponse = AccumulationsTotal;

export const useAccumulations = (userId: string) =>
  useQuery<UseAccumulationsResponse>({
    queryKey: accumulationsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseAccumulationsResponse>('/accumulations', { signal })) ?? [],
  });

export const useAccumulationsTotal = (userId: string) => {
  const query = useQuery<UseAccumulationsTotalResponse>({
    queryKey: accumulationsTotalQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseAccumulationsTotalResponse>('/accumulations/total', { signal })) ?? {
        total: 0,
      },
  });

  return { total: query.data?.total ?? 0, ...query };
};
