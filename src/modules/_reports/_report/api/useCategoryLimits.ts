import { categoryLimitsService, type CategoryLimit } from '@/shared/supabase/services/limits';
import { useQuery } from '@tanstack/react-query';

export const categoryLimitsQueryKey = (reportId: string) =>
  ['reports', reportId, 'limits'] as const;

export const useCategoryLimits = (reportId: string) =>
  useQuery<CategoryLimit[]>({
    queryKey: categoryLimitsQueryKey(reportId),
    enabled: Boolean(reportId),
    queryFn: async () => {
      const { data, error } = await categoryLimitsService.listByReport(reportId);
      if (error) throw error;
      return data ?? [];
    },
  });
