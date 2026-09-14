import type { Operation, OperationType } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /operations?reportId=&type=.
 * Для daily сервер сортирует по дате расхода, для остальных — по created_at.
 */

/** Параметры запроса (уходят в query-строку). */
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
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchOperations({ reportId, type }, signal),
  });
