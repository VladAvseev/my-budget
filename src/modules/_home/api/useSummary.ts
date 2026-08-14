import {
  operationsService,
  type OperationSummary,
} from '@/shared/supabase/services/operations';
import { useQuery } from '@tanstack/react-query';

export const useSummary = (reportId: string) =>
  useQuery<OperationSummary>({
    queryKey: ['reports', reportId, 'summary'],
    enabled: Boolean(reportId),
    queryFn: async () => {
      const summary = await operationsService.getSummary(reportId);
      return summary;
    },
    initialData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });