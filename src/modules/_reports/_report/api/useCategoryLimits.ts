import { api } from '@/shared/api/http';
import type { CategoryLimit } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports/:id/category-limits. */
export const categoryLimitsQueryKey = (reportId: string) =>
  ['reports', reportId, 'limits'] as const;

export const useCategoryLimits = (reportId: string) =>
  useQuery<CategoryLimit[]>({
    queryKey: categoryLimitsQueryKey(reportId),
    enabled: Boolean(reportId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await api.get<CategoryLimit[]>(`/reports/${reportId}/category-limits`)) ?? [],
  });
