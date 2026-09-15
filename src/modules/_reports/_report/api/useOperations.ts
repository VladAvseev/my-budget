import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /operations?reportId=&type=.
 */

/** Параметры запроса (уходят в query-строку). */
export interface UseOperationsRequest {
  reportId: string;
  type: ApiOperationType;
}

/** Ответ GET /operations?reportId=&type=. */
export type UseOperationsResponse = Operation[];

const fetchOperations = async ({ reportId, type }: UseOperationsRequest, signal?: AbortSignal) =>
  (await api.get<UseOperationsResponse>(`/operations?reportId=${reportId}&type=${type}`, {
    signal,
  })) ?? [];

export const useOperations = (reportId: string, type: ApiOperationType) =>
  useQuery<UseOperationsResponse>({
    queryKey: operationsQueryKey(reportId, type),
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchOperations({ reportId, type }, signal),
  });
