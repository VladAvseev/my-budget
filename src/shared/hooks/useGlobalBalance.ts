import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import type { OperationSummary } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './useProfile';

/**
 * Глобальный баланс: GET /users/me/summary (порт get_user_summary).
 * p_user_id не передаётся — сервер берёт пользователя из JWT.
 */

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

export const useUserSummary = (_userId: string) =>
  useQuery<OperationSummary>({
    queryKey: userSummaryQueryKey(_userId),
    enabled: Boolean(_userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<OperationSummary>('/users/me/summary')) ?? {
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
  const summary = summaryQuery.data ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const balance = startBalance + summary.income - summary.expense - summary.savings - summary.daily;

  return {
    balance,
    isLoading: summaryQuery.isLoading,
  };
};
