import { api } from '@/shared/api/http';
import type { OperationSummary } from '@/shared/api/hooks';
import { useQuery } from '@tanstack/react-query';

/** GET /reports/:id/summary — сводка по типам. */

/** Запрос — id отчёта из пути. */
export type UseSummaryRequest = string;

/** Ответ GET /reports/:id/summary — общая форма со сводкой пользователя. */
export type UseSummaryResponse = OperationSummary;

export const useSummary = (reportId: UseSummaryRequest) =>
  useQuery<UseSummaryResponse>({
    queryKey: ['reports', reportId, 'summary'],
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseSummaryResponse>(`/reports/${reportId}/summary`, { signal })) ?? {
        income: 0,
        expense: 0,
        savings: 0,
        daily: 0,
      },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });
