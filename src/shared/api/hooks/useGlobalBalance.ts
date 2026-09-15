import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Сводка сумм по типам операций — общая response-форма эндпоинтов
 * GET /users/me/summary и GET /reports/:id/summary
 * (серверные UserSummary / ReportSummary в `_users` и `_reports`).
 */
export interface OperationSummary {
  income: number;
  expense: number;
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
      },
    placeholderData: { income: 0, expense: 0 },
  });
