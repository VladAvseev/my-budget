import { useBootstrap } from '@/shared/api/hooks';

export interface OnboardingItem {
  id: string;
  label: string;
  actionLabel: string;
  route: string;
  done: boolean;
}

/**
 * Чек-лист онбординга из срезов GET /users/me/bootstrap (profile + onboarding):
 * отдельного запроса на главной больше нет — данные приходят вместе
 * с остальными цифрами одним bootstrap-ответом.
 */
const EMPTY_ONBOARDING = { categories: 0, reports: 0, operations: 0 };

export const useOnboardingChecklist = () => {
  const { data, isLoading, error } = useBootstrap();

  const profile = data?.profile ?? null;
  const counts = data?.onboarding ?? EMPTY_ONBOARDING;

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
    isLoading,
    error,
  };
};
