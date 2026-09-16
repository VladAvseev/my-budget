import { useMemo } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useCategories } from './useCategories';

export const useOverviewCategories = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const categoriesQuery = useCategories(userId);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'income'),
    [categories],
  );
  return {
    userId,
    isLoading: categoriesQuery.isLoading,
    expenseCategories,
    incomeCategories,
  };
};
