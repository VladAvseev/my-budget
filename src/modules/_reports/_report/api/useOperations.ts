import { isSavingsType, type Operation, type OperationType } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey, savingsGroupQueryKey, savingsOperationsQueryType } from './keys';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /operations?reportId=&type=.
 * Для daily сервер сортирует по дате расхода, для остальных — по created_at.
 * type допускает csv: обе savings-ветки забираются одним запросом.
 */

/** Параметры запроса (уходят в query-строку; для savings — csv обоих типов). */
export interface UseOperationsRequest {
  reportId: string;
  type: OperationType | typeof savingsOperationsQueryType;
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

/** Ответ useSavingsReportOperations: пополнения и снятия одним списком. */
export type UseSavingsReportOperationsResponse = Operation[];

export const useSavingsReportOperations = (reportId: string, enabled: boolean) =>
  useQuery<UseSavingsReportOperationsResponse>({
    queryKey: savingsGroupQueryKey(reportId),
    enabled: Boolean(reportId) && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) =>
      fetchOperations({ reportId, type: savingsOperationsQueryType }, signal),
  });
