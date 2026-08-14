import { operationsService, type OperationSummary } from '@/shared/supabase/services/operations';
import { summaryQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

export const useSummary = (reportId: string) =>
  useQuery<OperationSummary>({
    queryKey: summaryQueryKey(reportId),
    enabled: Boolean(reportId),
    queryFn: async () => {
      const summary = await operationsService.getSummary(reportId);
      return summary;
    },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });