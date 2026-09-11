import { growthDynamicsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /reports/:id: либо { name } — переименование,
 * либо { hasDailyExpenses, dailyBudget?, periodStart?, periodEnd? } —
 * вкл/выкл ежедневных расходов. Отсылаются только переданные поля —
 * сервер обновляет ровно их.
 */

/** Запрос PATCH /reports/:id — payload настроек (прежний ReportUpdateInput). */
export interface UseUpdateReportRequest {
  name?: string;
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart?: string;
  periodEnd?: string;
}

/** Ответ PATCH /reports/:id — обновлённый отчёт (200). */
export type UseUpdateReportResponse = Report;

/** Тело на проводе. */
interface UpdateReportBody {
  name?: string;
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart?: string;
  periodEnd?: string;
}

export const useUpdateReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UseUpdateReportRequest) => {
      const body: UpdateReportBody = {};
      if (input.name !== undefined) body.name = trimStrings(input.name);
      if (input.hasDailyExpenses !== undefined) body.hasDailyExpenses = input.hasDailyExpenses;
      if (input.dailyBudget !== undefined) body.dailyBudget = input.dailyBudget;
      if (input.periodStart !== undefined) body.periodStart = input.periodStart;
      if (input.periodEnd !== undefined) body.periodEnd = input.periodEnd;
      return api.patch<UseUpdateReportResponse>(`/reports/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'operations'] });
      // сдвиг period_start перекладывает savings-операции между месяцами графика
      queryClient.invalidateQueries({ queryKey: growthDynamicsQueryKey, exact: true });
      invalidateHomeCaches(queryClient);
    },
  });
};
