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
  operations: number;
}


export interface BootstrapGoalsSummary {
  hasGoals: boolean;
  totalSaved: number;
  totalTarget: number;
  percent: number;
  monthlyPlan: number;
  currentPeriodSaved: number;
  growthAvg: number | null;
  growthMonths: number;
  forecastMonths: number | null;
  forecastDate: string | null;
}


export interface UseBootstrapResponse {
  profile: BootstrapProfile;
  onboarding: BootstrapOnboarding;
  currentMonth: OperationSummary;
  trailingYear: OperationSummary;
  globalTotals: OperationSummary;
  goalsSummary: BootstrapGoalsSummary;
}


const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { currency: null, onboarded: false },
  onboarding: { categories: 0, operations: 0 },
  currentMonth: { income: 0, expense: 0 },
  trailingYear: { income: 0, expense: 0 },
  globalTotals: { income: 0, expense: 0 },
  goalsSummary: {
    hasGoals: false,
    totalSaved: 0,
    totalTarget: 0,
    percent: 0,
    monthlyPlan: 0,
    currentPeriodSaved: 0,
    growthAvg: null,
    growthMonths: 0,
    forecastMonths: null,
    forecastDate: null,
  },
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
