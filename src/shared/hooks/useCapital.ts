import { useAuth } from '@/shared/api/authProvider';
import { computeGlobalTotals } from '@/shared/utils';
import { useAccumulationsTotal } from './useAccumulations';
import { useProfile } from './useProfile';
import { useUserSummary } from './useGlobalBalance';

export const useCapital = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useProfile();
  const summaryQuery = useUserSummary(userId);
  const { total: initialSavings } = useAccumulationsTotal(userId);

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const { capital } = computeGlobalTotals(startBalance, summaryQuery.data, initialSavings);

  return { capital };
};
