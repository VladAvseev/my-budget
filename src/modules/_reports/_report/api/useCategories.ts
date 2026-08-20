import { supabase } from '@/shared/supabase/supabase';
import type { Category, CategoryType } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<Category[]>({
    queryKey: ['categories', userId, type],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_categories', {
        p_user_id: userId,
        p_type: type ?? null,
      });
      if (error) throw error;
      return (data as Category[]) ?? [];
    },
  });