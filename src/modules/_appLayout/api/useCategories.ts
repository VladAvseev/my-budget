import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export type UseCategoriesResponse = Category[];

const categoriesQueryKey = (userId: string) => ['categories', userId] as const;

export const useCategoriesByType = (userId: string, type: CategoryType) =>
  useQuery<UseCategoriesResponse, Error, UseCategoriesResponse>({
    queryKey: categoriesQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    select: (categories) => categories.filter((category) => category.type === type),
    queryFn: async ({ signal }) =>
      (await api.get<UseCategoriesResponse>('/categories', { signal })) ?? [],
  });
