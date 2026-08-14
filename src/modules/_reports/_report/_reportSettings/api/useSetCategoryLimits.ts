import { categoryLimitsService, type CategoryLimitInput } from '@/shared/supabase/services/limits';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryLimitsQueryKey } from '../../api/useCategoryLimits';

export const useSetCategoryLimits = (reportId: string, userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limits: CategoryLimitInput[]) =>
      categoryLimitsService.replaceLimits(reportId, userId, limits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryLimitsQueryKey(reportId) });
    },
  });
};
