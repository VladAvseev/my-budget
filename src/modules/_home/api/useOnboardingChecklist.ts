import { useProfile } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import { supabase } from '@/shared/supabase/supabase';
import { useQuery } from '@tanstack/react-query';

export interface OnboardingItem {
  id: string;
  label: string;
  done: boolean;
}

export interface OnboardingState {
  categories: number;
  reports: number;
  operations: number;
}

export const useOnboardingChecklist = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const profileQuery = useProfile();

  const countsQuery = useQuery<OnboardingState>({
    queryKey: ['onboardingCounts', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_onboarding_state', {
        p_user_id: userId,
      });
      if (error) throw error;
      return (data as OnboardingState) ?? { categories: 0, reports: 0, operations: 0 };
    },
  }); 

  const profile = profileQuery.data ?? null;
  const counts = countsQuery.data ?? { categories: 0, reports: 0, operations: 0 };

  const items: OnboardingItem[] = [
    {
      id: 'categories',
      label: 'Добавьте категории расходов в разделе "Профиль"',
      done: counts.categories > 0,
    },
    {
      id: 'report',
      label: 'Создайте первый отчёт в разделе "Отчёты"',
      done: counts.reports > 0,
    },
    {
      id: 'operations',
      label: 'Откройте новый отчёт и запишите первую операцию',
      done: counts.operations > 0,
    },
  ];

  return {
    items,
    allDone: items.every((item) => item.done),
    onboarded: profile?.onboarded ?? false,
    isLoading: profileQuery.isLoading || countsQuery.isLoading,
    error: profileQuery.error ?? countsQuery.error,
  };
};