import { useAuth } from '@/shared/supabase/authProvider';
import {
  profilesService,
  type Profile,
} from '@/shared/supabase/services/profiles';
import { categoriesService } from '@/shared/supabase/services/categories';
import { reportsService } from '@/shared/supabase/services/reports';
import { operationsService } from '@/shared/supabase/services/operations';
import { useQuery } from '@tanstack/react-query';

export interface OnboardingItem {
  id: string;
  label: string;
  done: boolean;
}

export const useOnboardingChecklist = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const profileQuery = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await profilesService.getOrCreateProfile(userId, {
        email: user.email,
      });
      if (error) throw error;
      return data ?? null;
    },
  });

  const categoriesQuery = useQuery<number>({
    queryKey: ['categoriesCount', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { count, error } = await categoriesService.countCategories(userId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const reportsQuery = useQuery<number>({
    queryKey: ['reportsCount', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { count, error } = await reportsService.countReports(userId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const operationsQuery = useQuery<number>({
    queryKey: ['operationsCount', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { count, error } = await operationsService.countOperations(userId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const profile = profileQuery.data ?? null;

  const items: OnboardingItem[] = [
    {
      id: 'startBalance',
      label: 'Укажите начальный баланс в разделе "Профиль"',
      done: profile?.start_balance != null,
    },
    {
      id: 'categories',
      label: 'Добавьте категории операций в разделе "Профиль"',
      done: (categoriesQuery.data ?? 0) > 0,
    },
    {
      id: 'report',
      label: 'Создайте первый отчёт в разделе "Отчёты"',
      done: (reportsQuery.data ?? 0) > 0,
    },
    {
      id: 'operations',
      label: 'Откройте новый отчёт и добавьте первую операцию',
      done: (operationsQuery.data ?? 0) > 0,
    },
  ];

  return {
    items,
    allDone: items.every((item) => item.done),
    onboarded: profile?.onboarded ?? false,
    isLoading:
      profileQuery.isLoading ||
      categoriesQuery.isLoading ||
      reportsQuery.isLoading ||
      operationsQuery.isLoading,
    error:
      profileQuery.error ??
      categoriesQuery.error ??
      reportsQuery.error ??
      operationsQuery.error,
  };
};