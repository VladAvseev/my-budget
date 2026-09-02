import { supabase } from '@/shared/supabase/supabase';
import type { Accumulation } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const accumulationsQueryKey = (userId: string) => ['accumulations', userId] as const;

export const useAccumulations = (userId: string) =>
  useQuery<Accumulation[]>({
    queryKey: accumulationsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_accumulations', { p_user_id: userId });
      if (error) throw error;
      return (data as Accumulation[]) ?? [];
    },
  });

export const useAccumulationsTotal = (userId: string) => {
  const accumulationsQuery = useAccumulations(userId);
  const accumulations = accumulationsQuery.data ?? [];
  const total = accumulations.reduce((sum, accumulation) => sum + (Number(accumulation.amount) || 0), 0);
  return { total, accumulations, ...accumulationsQuery };
};