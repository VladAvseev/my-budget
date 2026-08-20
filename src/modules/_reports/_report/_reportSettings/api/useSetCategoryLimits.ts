import { supabase } from '@/shared/supabase/supabase';
import type { CategoryLimitInput } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryLimitsQueryKey } from '../../api/useCategoryLimits';

export const useSetCategoryLimits = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limits: CategoryLimitInput[]) => {
      const { error } = await supabase.rpc('set_category_limits', {
        p_report_id: reportId,
        p_limits: limits,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryLimitsQueryKey(reportId) });
    },
  });
};