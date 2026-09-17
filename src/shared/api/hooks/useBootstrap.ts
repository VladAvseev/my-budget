import { api } from '@/shared/api/http';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { OperationSummary } from './useGlobalBalance';




export interface BootstrapProfile {
  currency: string | null;
  onboarded: boolean;
}


export interface BootstrapOnboarding {
  categories: number;
  reports: number;
  operations: number;
}


export interface BootstrapLastReport {
  id: string;
  name: string;
  
  period_start: string | null;
  period_end: string | null;
  summary: OperationSummary;
}


export interface UseBootstrapResponse {
  profile: BootstrapProfile;
  onboarding: BootstrapOnboarding;
  lastReport: BootstrapLastReport | null;
  globalTotals: OperationSummary;
}


const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { currency: null, onboarded: false },
  onboarding: { categories: 0, reports: 0, operations: 0 },
  lastReport: null,
  globalTotals: { income: 0, expense: 0 },
};

export const bootstrapQueryKey = ['bootstrap'] as const;

export const useBootstrap = () =>
  useQuery<UseBootstrapResponse>({
    queryKey: bootstrapQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseBootstrapResponse>('/users/me/bootstrap', { signal })) ?? EMPTY_BOOTSTRAP,
  });


export const invalidateHomeCaches = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: bootstrapQueryKey });
};
