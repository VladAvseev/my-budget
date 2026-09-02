import { supabase } from '@/shared/supabase/supabase';
import type { Category, CategoryType } from '@/shared/supabase/types/domain';
import { categoriesQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<Category[]>({
    queryKey: categoriesQueryKey(userId, type),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_categories', {
        p_user_id: userId,
        p_type: type ?? null,
      });
      if (error) throw error;
      return (data as Category[]) ?? [];
    },
  });