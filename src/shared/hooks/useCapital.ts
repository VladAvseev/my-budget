import { useAuth } from '@/shared/supabase/authProvider';
import { useGlobalBalance, useUserSummary } from './useGlobalBalance';
import { useAccumulationsTotal } from './useAccumulations';

export const useCapital = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { balance, isLoading: isBalanceLoading } = useGlobalBalance();
  const summaryQuery = useUserSummary(userId);
  const accumulationsQuery = useAccumulationsTotal(userId);

  const accumulations = accumulationsQuery.accumulations;
  const totalAccumulations = accumulationsQuery.total;
  const summary = summaryQuery.data ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const totalSavings = summary.savings;
  const capital = balance + totalSavings + totalAccumulations;

  return {
    capital,
    balance,
    totalSavings,
    totalAccumulations,
    accumulations,
    isLoading: isBalanceLoading || summaryQuery.isLoading || accumulationsQuery.isLoading,
  };
};