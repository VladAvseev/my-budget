import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { categoriesQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

export interface UseCategoriesRequest {
  type?: CategoryType;
}

export type UseCategoriesResponse = Category[];

export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<UseCategoriesResponse>({
    queryKey: categoriesQueryKey(userId, type),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseCategoriesResponse>(`/categories${type ? `?type=${type}` : ''}`, {
        signal,
      })) ?? [],
  });
