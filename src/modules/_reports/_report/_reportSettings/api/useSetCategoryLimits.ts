import { api } from '@/shared/api/http';
import type { CategoryLimitInput } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryLimitsQueryKey } from '../../api/useCategoryLimits';

/**
 * PUT /reports/:id/category-limits: полная
 * замена лимитов. Тело сервера ждёт { limits: [{ categoryId, amount }] } —
 * reportId из каждого элемента клиента здесь не нужен.
 */
export const useSetCategoryLimits = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limits: CategoryLimitInput[]) => {
      await api.put(`/reports/${reportId}/category-limits`, {
        limits: limits.map(({ categoryId, amount }) => ({ categoryId, amount })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryLimitsQueryKey(reportId) });
    },
  });
};
