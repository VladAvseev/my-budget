import { isSavingsType, type Operation, type OperationType } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey } from './keys';
import { useQueries, useQuery } from '@tanstack/react-query';

/**
 * GET /operations?reportId=&type=.
 * Для daily сервер сортирует по дате расхода, для остальных — по created_at.
 */
const fetchOperations = async (reportId: string, type: OperationType) =>
  (await api.get<Operation[]>(`/operations?reportId=${reportId}&type=${type}`)) ?? [];

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
