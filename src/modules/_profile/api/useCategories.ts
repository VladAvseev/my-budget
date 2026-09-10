import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { categoriesQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

/** GET /categories [?type=]: все или по типу. */
export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<Category[]>({
    queryKey: categoriesQueryKey(userId, type),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<Category[]>(`/categories${type ? `?type=${type}` : ''}`)) ?? [],
  });
