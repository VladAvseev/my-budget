import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /categories [?type=] для страницы отчёта. */

/** Фильтр запроса (userId — только ключ кэша, на сервер не уходит). */
export interface UseCategoriesRequest {
  type?: CategoryType;
}

/** Ответ GET /categories. */
export type UseCategoriesResponse = Category[];

export const useCategories = (userId: string, type?: CategoryType) =>
  useQuery<UseCategoriesResponse>({
    queryKey: ['categories', userId, type],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseCategoriesResponse>(`/categories${type ? `?type=${type}` : ''}`, {
        signal,
      })) ?? [],
  });
