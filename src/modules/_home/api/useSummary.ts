import { api } from '@/shared/api/http';
import type { OperationSummary } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports/:id/summary — сводка по типам. */
export const useSummary = (reportId: string) =>
  useQuery<OperationSummary>({
    queryKey: ['reports', reportId, 'summary'],
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<OperationSummary>(`/reports/${reportId}/summary`)) ?? {
        income: 0,
        expense: 0,
        savings: 0,
        daily: 0,
      },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });
