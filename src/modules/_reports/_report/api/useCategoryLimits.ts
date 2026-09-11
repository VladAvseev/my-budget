import { api } from '@/shared/api/http';
import type { CategoryLimit } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports/:id/category-limits. */
export const categoryLimitsQueryKey = (reportId: string) =>
  ['reports', reportId, 'limits'] as const;

/** Ответ GET /reports/:id/category-limits. */
export type UseCategoryLimitsResponse = CategoryLimit[];

export const useCategoryLimits = (reportId: string) =>
  useQuery<UseCategoryLimitsResponse>({
    queryKey: categoryLimitsQueryKey(reportId),
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseCategoryLimitsResponse>(`/reports/${reportId}/category-limits`, {
        signal,
      })) ?? [],
  });
