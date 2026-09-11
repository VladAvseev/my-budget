import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import { computeGlobalTotals } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from './useProfile';

/**
 * Сводка сумм по типам операций — общая response-форма эндпоинтов
 * GET /users/me/summary и GET /reports/:id/summary
 * (серверные UserSummary / ReportSummary в `_users` и `_reports`).
 */
export interface OperationSummary {
  income: number;
  expense: number;
  savings: number;
  daily: number;
}

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

/** Ответ GET /users/me/summary. */
export type UseUserSummaryResponse = OperationSummary;

export const useUserSummary = (_userId: string) =>
  useQuery<UseUserSummaryResponse>({
    queryKey: userSummaryQueryKey(_userId),
    enabled: Boolean(_userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseUserSummaryResponse>('/users/me/summary', { signal })) ?? {
        income: 0,
        expense: 0,
        savings: 0,
        daily: 0,
      },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });

/** Композиция profile + userSummary, прямого запроса нет — Request/Response не заводятся. */
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
