import { api } from '@/shared/api/http';
import type { Category } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /categories для overview: список маленький, поэтому тянем все категории
 * одним запросом (ключ ['categories', userId] попадает под префиксные
 * инвалидации модуля _profile), а деление по типу делает useOverviewCategories
 * локально, чтобы не плодить подписки на каждую вкладку.
 */

/** Ответ GET /categories. */
export type UseCategoriesResponse = Category[];

export const categoriesQueryKey = (userId: string) => ['categories', userId] as const;

const fetchCategories = async (signal: AbortSignal) =>
  (await api.get<UseCategoriesResponse>('/categories', { signal })) ?? [];

/** Все категории пользователя одним запросом. */
export const useCategories = (userId: string) =>
  useQuery<UseCategoriesResponse>({
    queryKey: categoriesQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchCategories(signal),
  });
