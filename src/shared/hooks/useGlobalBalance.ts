import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import type { OperationSummary } from '@/shared/api/types/domain';
import { computeGlobalTotals } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './useProfile';

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

export const useUserSummary = (_userId: string) =>
  useQuery<OperationSummary>({
    queryKey: userSummaryQueryKey(_userId),
    enabled: Boolean(_userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<OperationSummary>('/users/me/summary', { signal })) ?? {
        income: 0,
        expense: 0,
        savings: 0,
        daily: 0,
      },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });

export const useGlobalBalance = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useProfile();
  const summaryQuery = useUserSummary(userId);

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const { balance } = computeGlobalTotals(startBalance, summaryQuery.data, 0);

  return {
    balance,
    isLoading: summaryQuery.isLoading,
  };
};
