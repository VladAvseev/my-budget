import { isSavingsType, type Operation, type OperationType } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey } from './keys';
import { useQueries, useQuery } from '@tanstack/react-query';

/**
 * GET /operations?reportId=&type=.
 * Для daily сервер сортирует по дате расхода, для остальных — по created_at.
 */

/** Параметры запроса (уходят в query-строку; type= savings/savings_out берётся из savings-хуков). */
export interface UseOperationsRequest {
  reportId: string;
  type: OperationType;
}

/** Ответ GET /operations?reportId=&type=. */
export type UseOperationsResponse = Operation[];

const fetchOperations = async ({ reportId, type }: UseOperationsRequest, signal?: AbortSignal) =>
  (await api.get<UseOperationsResponse>(`/operations?reportId=${reportId}&type=${type}`, {
    signal,
  })) ?? [];

export const useOperations = (reportId: string, type: OperationType) =>
  useQuery<UseOperationsResponse>({
    queryKey: operationsQueryKey(reportId, type),
    enabled: Boolean(reportId) && !isSavingsType(type),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchOperations({ reportId, type }, signal),
  });

/** Ответ useSavingsReportOperations: два запроса savings/savings_out. */
export type UseSavingsReportOperationsResponse = UseOperationsResponse[];

export const useSavingsReportOperations = (reportId: string, enabled: boolean) =>
  useQueries({
    queries: (['savings', 'savings_out'] as const).map((type) => ({
      queryKey: operationsQueryKey(reportId, type),
      enabled: Boolean(reportId) && enabled,
      staleTime: 5 * 60 * 1000,
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        fetchOperations({ reportId, type }, signal),
    })),
  });
