import { api } from '@/shared/api/http';
import type { OperationSummary } from '@/shared/api/types/domain';
import { summaryQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

/** GET /reports/:id/summary. */
export const useSummary = (reportId: string) =>
  useQuery<OperationSummary>({
    queryKey: summaryQueryKey(reportId),
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<OperationSummary>(`/reports/${reportId}/summary`, { signal })) ?? {
        income: 0,
        expense: 0,
        savings: 0,
        daily: 0,
      },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });
