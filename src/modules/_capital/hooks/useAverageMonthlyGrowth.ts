import { useMemo } from 'react';
import { useAccounts, useCapitalDynamics, useProfile } from '@/shared/api/hooks';
import { buildCapitalChartData } from '../utils/buildCapitalChartData';
import { buildRecentMonthlyGrowth } from '@/shared/widgets/GrowthDynamicsCard/model/buildGrowthStats';

export const useAverageMonthlyGrowth = (userId: string) => {
  const dynamics = useCapitalDynamics();
  const accounts = useAccounts(userId);
  const profile = useProfile();
  const isLoading = dynamics.isLoading || accounts.isLoading || profile.isLoading;
  const error = dynamics.error ?? accounts.error ?? profile.error;
  const growth = useMemo(() => {
    if (isLoading || error) return { avg: null, months: 0 };
    const base = (accounts.data ?? []).reduce((sum, account) => sum + account.initial_balance, 0);
    return buildRecentMonthlyGrowth(
      buildCapitalChartData({ months: dynamics.data ?? [], base }),
      base,
      { firstActivityDate: profile.data?.created_at ? new Date(profile.data.created_at) : null },
    );
  }, [accounts.data, dynamics.data, profile.data, isLoading, error]);
  return { ...growth, isLoading, error };
};
