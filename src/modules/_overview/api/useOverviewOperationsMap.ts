import { supabase } from '@/shared/supabase/supabase';
import type { Operation } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

const overviewOperationsQueryKey = (reportIds: string[]) =>
  ['overview', 'operations', [...reportIds].sort().join('|')] as const;

export const useOverviewOperationsMap = (reportIds: string[]) =>
  useQuery<Map<string, Operation[]>>({
    queryKey: overviewOperationsQueryKey(reportIds),
    enabled: reportIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_operations_by_reports', {
        p_report_ids: reportIds,
      });
      if (error) throw error;
      const operations = (data as Operation[]) ?? [];
      const map = new Map<string, Operation[]>();
      for (const operation of operations) {
        const list = map.get(operation.report_id) ?? [];
        list.push(operation);
        map.set(operation.report_id, list);
      }
      return map;
    },
  });