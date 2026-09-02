import { supabase } from '@/shared/supabase/supabase';
import type { Operation } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export type SavingsOperation = Operation & { reportName: string; reportPeriodStart: string };

export const useSavingsOperations = (userId: string) =>
  useQuery<SavingsOperation[]>({
    queryKey: ['savingsOperations', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_savings_operations', {
        p_user_id: userId,
      });
      if (error) throw error;
      return (data as SavingsOperation[]) ?? [];
    },
  });