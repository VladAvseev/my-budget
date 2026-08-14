import {
  categoriesService,
  type Category,
  type CategoryType,
} from '@/shared/supabase/services/categories';
import { categoriesQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<Category[]>({
    queryKey: categoriesQueryKey(userId, type),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await categoriesService.listCategories(userId, type);
      if (error) throw error;
      return data ?? [];
    },
  });