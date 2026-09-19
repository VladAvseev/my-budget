import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { api } from '@/shared/api/http';
import { operationsQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';



export interface UseOperationsRequest {
  month: string;
  type: ApiOperationType;
}


export type UseOperationsResponse = Operation[];

const fetchOperations = async ({ month, type }: UseOperationsRequest, signal?: AbortSignal) =>
  (await api.get<UseOperationsResponse>(`/operations?months=${month}&type=${type}`, {
    signal,
  })) ?? [];

export const useOperations = (month: string, type: ApiOperationType) =>
  useQuery<UseOperationsResponse>({
    queryKey: operationsQueryKey(month, type),
    enabled: Boolean(month),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchOperations({ month, type }, signal),
  });
