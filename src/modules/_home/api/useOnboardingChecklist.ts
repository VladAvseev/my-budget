import { useProfile } from '@/shared/hooks';
import { useAuth } from '@/shared/api/authProvider';
import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface OnboardingItem {
  id: string;
  label: string;
  actionLabel: string;
  route: string;
  done: boolean;
}

export interface OnboardingState {
  categories: number;
  reports: number;
  operations: number;
}

/**
 * Чек-лист онбординга: счётчики из GET /users/me/onboarding
 * (порт get_onboarding_state) + профиль из useProfile.
 */
export const useOnboardingChecklist = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const profileQuery = useProfile();

  const countsQuery = useQuery<OnboardingState>({
    queryKey: ['onboardingCounts', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<OnboardingState>('/users/me/onboarding')) ?? {
        categories: 0,
        reports: 0,
        operations: 0,
      },
  });

  const profile = profileQuery.data ?? null;
  const counts = countsQuery.data ?? { categories: 0, reports: 0, operations: 0 };

  const items: OnboardingItem[] = [
    {
      id: 'currency',
      label: 'Выберите подходящую валюту в разделе "Профиль" ',
      actionLabel: 'В профиль',
      route: '/profile',
      done: profile?.currency !== null && profile?.currency !== undefined,
    },
    {
      id: 'categories',
      label: 'Добавьте категории расходов в разделе "Профиль"',
      actionLabel: 'В профиль',
      route: '/profile',
      done: counts.categories > 0,
    },
    {
      id: 'report',
      label: 'Добавьте первый период в разделе «Периоды»',
      actionLabel: 'К периодам',
      route: '/reports',
      done: counts.reports > 0,
    },
    {
      id: 'operations',
      label: 'Откройте новый период и запишите первую операцию',
      actionLabel: 'К периодам',
      route: '/reports',
      done: counts.operations > 0,
    },
  ];

  return {
    items,
    nextItem: items.find((item) => !item.done) ?? null,
    allDone: items.every((item) => item.done),
    onboarded: profile?.onboarded ?? false,
    isLoading: profileQuery.isLoading || countsQuery.isLoading,
    error: profileQuery.error ?? countsQuery.error,
  };
};
