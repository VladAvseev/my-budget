import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /categories для страницы отчёта: список маленький, поэтому тянем
 * все категории одним запросом (ключ ['categories', userId] попадает под
 * префиксные инвалидации модуля _profile), а тип — локальный select-фильтр,
 * чтобы не плодить HTTP на каждую вкладку/модалку.
 */

/** Ответ GET /categories. */
export type UseCategoriesResponse = Category[];

const categoriesQueryKey = (userId: string) => ['categories', userId] as const;

const fetchCategories = async (signal: AbortSignal) =>
  (await api.get<UseCategoriesResponse>('/categories', { signal })) ?? [];

/** Категории пользователя нужного типа (данные одного общего запроса). */
export const useCategoriesByType = (userId: string, type: CategoryType) =>
  useQuery<UseCategoriesResponse, Error, UseCategoriesResponse>({
    queryKey: categoriesQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    select: (categories) => categories.filter((category) => category.type === type),
    queryFn: ({ signal }) => fetchCategories(signal),
  });
