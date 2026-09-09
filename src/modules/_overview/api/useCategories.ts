import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /categories?type= (порт get_categories); user — из JWT, userId — ключ кэша. */
export const useCategories = (userId: string, type: CategoryType) =>
  useQuery<Category[]>({
    queryKey: ['categories', userId, type],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await api.get<Category[]>(`/categories?type=${type}`)) ?? [],
  });
