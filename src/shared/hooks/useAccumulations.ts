import { accumulationsService, type Accumulation } from '@/shared/supabase/services/accumulations';
import { useQuery } from '@tanstack/react-query';

export const accumulationsQueryKey = (userId: string) => ['accumulations', userId] as const;

export const useAccumulations = (userId: string) =>
  useQuery<Accumulation[]>({
    queryKey: accumulationsQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await accumulationsService.listAccumulations(userId);
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAccumulationsTotal = (userId: string) => {
  const accumulationsQuery = useAccumulations(userId);
  const accumulations = accumulationsQuery.data ?? [];
  const total = accumulations.reduce((sum, accumulation) => sum + (Number(accumulation.amount) || 0), 0);
  return { total, accumulations, ...accumulationsQuery };
};