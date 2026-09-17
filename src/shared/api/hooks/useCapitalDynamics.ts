import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';


export interface CapitalMonth {
  month: string;
  delta: number;
}


export const capitalDynamicsQueryKey = ['reports', 'capital-dynamics'] as const;


export type UseCapitalDynamicsResponse = CapitalMonth[];

export const useCapitalDynamics = () =>
  useQuery<UseCapitalDynamicsResponse>({
    queryKey: capitalDynamicsQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseCapitalDynamicsResponse>('/reports/capital-dynamics', { signal })) ?? [],
  });
