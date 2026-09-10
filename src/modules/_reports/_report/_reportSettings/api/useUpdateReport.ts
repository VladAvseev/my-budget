import { api } from '@/shared/api/http';
import type { ReportUpdateInput } from '@/shared/api/types/domain';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /reports/:id: либо { name } — переименование,
 * либо { hasDailyExpenses, dailyBudget?, periodStart?, periodEnd? } —
 * вкл/выкл ежедневных расходов. Отсылаются только переданные поля —
 * сервер обновляет ровно их.
 */
export const useUpdateReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReportUpdateInput) => {
      const body: Record<string, unknown> = {};
      if (input.name !== undefined) body.name = trimStrings(input.name);
      if (input.hasDailyExpenses !== undefined) body.hasDailyExpenses = input.hasDailyExpenses;
      if (input.dailyBudget !== undefined) body.dailyBudget = input.dailyBudget;
      if (input.periodStart !== undefined) body.periodStart = input.periodStart;
      if (input.periodEnd !== undefined) body.periodEnd = input.periodEnd;
      await api.patch(`/reports/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'operations'] });
    },
  });
};
