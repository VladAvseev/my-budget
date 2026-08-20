import { useAuth } from '@/shared/supabase/authProvider';
import { supabase } from '@/shared/supabase/supabase';
import type { OperationSummary } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './useProfile';

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

export const useUserSummary = (userId: string) =>
  useQuery<OperationSummary>({
    queryKey: userSummaryQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_summary', { p_user_id: userId });
      if (error) throw error;
      return (data as OperationSummary) ?? { income: 0, expense: 0, savings: 0, daily: 0 };
    },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });

export const useGlobalBalance = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useProfile();
  const summaryQuery = useUserSummary(userId);

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const summary = summaryQuery.data ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const balance = startBalance + summary.income - summary.expense - summary.savings - summary.daily;

  return {
    balance,
    isLoading: summaryQuery.isLoading,
  };
};