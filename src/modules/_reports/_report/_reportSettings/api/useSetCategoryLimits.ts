import { api } from '@/shared/api/http';
import type { CategoryLimit } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryLimitsQueryKey } from '../../api/useCategoryLimits';

/**
 * PUT /reports/:id/category-limits: полная
 * замена лимитов. Тело сервера ждёт { limits: [{ categoryId, amount }] } —
 * reportId из каждого элемента клиента здесь не нужен.
 */

/** Один лимит в запросе (прежний CategoryLimitInput без reportId — он в пути). */
export interface UseSetCategoryLimitsRequestItem {
  categoryId: string;
  amount: number;
}

/** Запрос — полный набор лимитов отчёта. */
export type UseSetCategoryLimitsRequest = UseSetCategoryLimitsRequestItem[];

/** Ответ PUT /reports/:id/category-limits — сохранённый список лимитов (200). */
export type UseSetCategoryLimitsResponse = CategoryLimit[];

/** Тело на проводе. */
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
