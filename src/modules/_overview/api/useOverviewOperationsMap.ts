import { operationsService, type Operation } from '@/shared/supabase/services/operations';
import { useQuery } from '@tanstack/react-query';

const overviewOperationsQueryKey = (reportIds: string[]) =>
  ['overview', 'operations', [...reportIds].sort().join('|')] as const;

export const useOverviewOperationsMap = (reportIds: string[]) =>
  useQuery<Map<string, Operation[]>>({
    queryKey: overviewOperationsQueryKey(reportIds),
    enabled: reportIds.length > 0,
    queryFn: async () => {
      const operations = await operationsService.listOperationsByReports(reportIds);
      const map = new Map<string, Operation[]>();
      for (const operation of operations) {
        const list = map.get(operation.report_id) ?? [];
        list.push(operation);
        map.set(operation.report_id, list);
      }
      return map;
    },
  });