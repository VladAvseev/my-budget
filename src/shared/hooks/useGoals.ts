import { supabase } from '@/shared/supabase/supabase';
import type { Goal } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const goalsQueryKey = (userId: string) => ['goals', userId] as const;

export const useGoals = (userId: string) =>
  useQuery<Goal[]>({
    queryKey: goalsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_goals', { p_user_id: userId });
      if (error) throw error;
      return (data as Goal[]) ?? [];
    },
  });
