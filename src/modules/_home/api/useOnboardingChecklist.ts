import { useBootstrap } from '@/shared/api/hooks';

export interface OnboardingItem {
  id: string;
  label: string;
  actionLabel: string;
  route: string;
  done: boolean;
}

const EMPTY_ONBOARDING = { categories: 0, operations: 0 };

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
      id: 'operations',
      label: 'Запишите первую операцию',
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
