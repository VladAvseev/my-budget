import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /accumulations (порт get_accumulations); user — из токена, userId — для ключа кэша. */
export const accumulationsQueryKey = (userId: string) => ['accumulations', userId] as const;

export const useAccumulations = (userId: string) =>
  useQuery<Accumulation[]>({
    queryKey: accumulationsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await api.get<Accumulation[]>('/accumulations')) ?? [],
  });

export const useAccumulationsTotal = (userId: string) => {
  const accumulationsQuery = useAccumulations(userId);
  const accumulations = accumulationsQuery.data ?? [];
  const total = accumulations.reduce(
    (sum, accumulation) => sum + (Number(accumulation.amount) || 0),
    0,
  );
  return { total, accumulations, ...accumulationsQuery };
};
