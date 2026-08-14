import { operationsService } from '@/shared/supabase/services/operations';
import { useQueries } from '@tanstack/react-query';

const overviewOperationsQueryKey = (reportId: string) =>
  ['overview', 'operations', reportId] as const;

export const useOverviewOperationsMap = (reportIds: string[]) =>
  useQueries({
    queries: reportIds.map((reportId) => ({
      queryKey: overviewOperationsQueryKey(reportId),
      enabled: Boolean(reportId),
      queryFn: async () => {
        const { data, error } = await operationsService.listOperations(reportId);
        if (error) throw error;
        return data ?? [];
      },
    })),
  });