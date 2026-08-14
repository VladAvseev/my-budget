import {
  isSavingsType,
  operationsService,
  type Operation,
  type OperationType,
} from '@/shared/supabase/services/operations';
import { operationsQueryKey } from './keys';
import { useQueries, useQuery } from '@tanstack/react-query';

export const useOperations = (reportId: string, type: OperationType) =>
  useQuery<Operation[]>({
    queryKey: operationsQueryKey(reportId, type),
    enabled: Boolean(reportId) && !isSavingsType(type),
    queryFn: async () => {
      const { data, error } = await operationsService.listByType(reportId, type);
      if (error) throw error;
      return data ?? [];
    },
  });

export const useSavingsReportOperations = (reportId: string, enabled: boolean) =>
  useQueries({
    queries: (['savings', 'savings_out'] as const).map((type) => ({
      queryKey: operationsQueryKey(reportId, type),
      enabled: Boolean(reportId) && enabled,
      queryFn: async () => {
        const { data, error } = await operationsService.listByType(reportId, type);
        if (error) throw error;
        return data ?? [];
      },
    })),
  });