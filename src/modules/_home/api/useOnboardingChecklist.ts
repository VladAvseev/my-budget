import { useProfile } from '@/shared/api/hooks';
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

/** Ответ GET /users/me/onboarding — счётчики чек-листа (серверный OnboardingState). */
export interface OnboardingState {
  categories: number;
  reports: number;
  operations: number;
}

/** Данные внутреннего запроса счётчиков (пользователь — из JWT). */
export type UseOnboardingCountsResponse = OnboardingState;

/**
 * Чек-лист онбординга: счётчики из GET /users/me/onboarding + профиль из useProfile.
 */
export const useOnboardingChecklist = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const profileQuery = useProfile();

  const countsQuery = useQuery<UseOnboardingCountsResponse>({
    queryKey: ['onboardingCounts', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseOnboardingCountsResponse>('/users/me/onboarding', { signal })) ?? {
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
