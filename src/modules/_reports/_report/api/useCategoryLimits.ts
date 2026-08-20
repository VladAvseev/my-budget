import { supabase } from '@/shared/supabase/supabase';
import type { CategoryLimit } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const categoryLimitsQueryKey = (reportId: string) =>
  ['reports', reportId, 'limits'] as const;

export const useCategoryLimits = (reportId: string) =>
  useQuery<CategoryLimit[]>({
    queryKey: categoryLimitsQueryKey(reportId),
    enabled: Boolean(reportId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_category_limits', {
        p_report_id: reportId,
      });
      if (error) throw error;
      return (data as CategoryLimit[]) ?? [];
    },
  });