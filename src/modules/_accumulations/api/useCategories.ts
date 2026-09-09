import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /categories?type= (порт get_categories) для страницы накоплений. */
export const useCategories = (userId: string, type: CategoryType = 'savings') =>
  useQuery<Category[]>({
    queryKey: ['categories', userId, type],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await api.get<Category[]>(`/categories?type=${type}`)) ?? [],
  });
