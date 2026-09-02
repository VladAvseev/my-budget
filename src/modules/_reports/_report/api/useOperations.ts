import { isSavingsType, type Operation, type OperationType } from '@/shared/supabase/types/domain';
import { supabase } from '@/shared/supabase/supabase';
import { operationsQueryKey } from './keys';
import { useQueries, useQuery } from '@tanstack/react-query';

const fetchOperations = async (reportId: string, type: OperationType) => {
  const { data, error } = await supabase.rpc('get_operations_by_report', {
    p_report_id: reportId,
    p_type: type,
  });
  if (error) throw error;
  return (data as Operation[]) ?? [];
};

export const useOperations = (reportId: string, type: OperationType) =>
  useQuery<Operation[]>({
    queryKey: operationsQueryKey(reportId, type),
    enabled: Boolean(reportId) && !isSavingsType(type),
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchOperations(reportId, type),
  });

export const useSavingsReportOperations = (reportId: string, enabled: boolean) =>
  useQueries({
    queries: (['savings', 'savings_out'] as const).map((type) => ({
      queryKey: operationsQueryKey(reportId, type),
      enabled: Boolean(reportId) && enabled,
      staleTime: 5 * 60 * 1000,
      queryFn: () => fetchOperations(reportId, type),
    })),
  });