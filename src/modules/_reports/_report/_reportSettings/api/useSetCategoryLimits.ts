import { api } from '@/shared/api/http';
import type { CategoryLimit } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryLimitsQueryKey } from '../../api/useCategoryLimits';

export interface UseSetCategoryLimitsRequestItem {
  categoryId: string;
  amount: number;
}

export type UseSetCategoryLimitsRequest = UseSetCategoryLimitsRequestItem[];

export type UseSetCategoryLimitsResponse = CategoryLimit[];

interface SetCategoryLimitsBody {
  limits: { categoryId: string; amount: number }[];
}

export const useSetCategoryLimits = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation<UseSetCategoryLimitsResponse, Error, UseSetCategoryLimitsRequest, unknown>({
    mutationFn: async (limits) => {
      const body: SetCategoryLimitsBody = {
        limits: limits.map(({ categoryId, amount }) => ({ categoryId, amount })),
      };
      return api.put<UseSetCategoryLimitsResponse>(`/reports/${reportId}/category-limits`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryLimitsQueryKey(reportId) });
    },
  });
};
