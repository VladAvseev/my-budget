import { useAuth } from '@/shared/supabase/authProvider';
import { operationsService, type OperationSummary } from '@/shared/supabase/services/operations';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './useProfile';

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

export const useUserSummary = (userId: string) =>
  useQuery<OperationSummary>({
    queryKey: userSummaryQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const summary = await operationsService.getUserSummary(userId);
      return summary;
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