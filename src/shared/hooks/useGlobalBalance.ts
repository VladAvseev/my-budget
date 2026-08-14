import { useAuth } from '@/shared/supabase/authProvider';
import { operationsService, type OperationSummary } from '@/shared/supabase/services/operations';
import { profilesService, type Profile } from '@/shared/supabase/services/profiles';
import { useQuery } from '@tanstack/react-query';

export const userSummaryQueryKey = (userId: string) => ['userSummary', userId] as const;

export const useUserSummary = (userId: string) =>
  useQuery<OperationSummary>({
    queryKey: userSummaryQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const summary = await operationsService.getUserSummary(userId);
      return summary;
    },
    initialData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });

export const useGlobalBalance = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profileQuery = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await profilesService.getOrCreateProfile(userId, {
        email: user?.email,
      });
      if (error) throw error;
      return data ?? null;
    },
  });
  const summaryQuery = useUserSummary(userId);

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const summary = summaryQuery.data ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const balance = startBalance + summary.income - summary.expense - summary.savings - summary.daily;

  return {
    balance,
    isLoading: summaryQuery.isLoading,
  };
};