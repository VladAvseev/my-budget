import { api } from '@/shared/api/http';
import type { OperationSummary } from '@/shared/api/hooks';
import { summaryQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';




export type UseSummaryRequest = string;


export type UseSummaryResponse = OperationSummary;

export const useSummary = (reportId: UseSummaryRequest) =>
  useQuery<UseSummaryResponse>({
    queryKey: summaryQueryKey(reportId),
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseSummaryResponse>(`/reports/${reportId}/summary`, { signal })) ?? {
        income: 0,
        expense: 0,
      },
    placeholderData: { income: 0, expense: 0 },
  });
