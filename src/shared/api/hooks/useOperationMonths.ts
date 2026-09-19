import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export const operationMonthsQueryKey = ['operations', 'months'] as const;

export type UseOperationMonthsResponse = string[];

export const useOperationMonths = () =>
  useQuery<UseOperationMonthsResponse>({
    queryKey: operationMonthsQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseOperationMonthsResponse>('/operations/months', { signal })) ?? [],
  });
