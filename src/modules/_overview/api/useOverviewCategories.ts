import { useAuth } from '@/shared/supabase/authProvider';
import { useCategories } from './useCategories';

export const useOverviewCategories = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  return {
    userId,
    expenseCategories: useCategories(userId, 'expense'),
    incomeCategories: useCategories(userId, 'income'),
    savingsCategories: useCategories(userId, 'savings'),
  };
};