import { useAuth } from '@/shared/api/authProvider';
import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { getNextFreeDate } from '@/shared/utils/date';
import { trimStrings } from '@/shared/utils';
import { operationsQueryKey } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /reports/:id/daily-expenses (порт create_daily_expense): сервер сам
 * ищет первую свободную дату периода отчёта (по своей копии периода —
 * надёжнее, чем аргументы клиента; periodStart/periodEnd в сигнатуре
 * оставлены для оптимистичной даты в кэше).
 */
const createDailyExpenseMutationKey = ['createDailyExpense'] as const;

export const useCreateDailyExpense = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createDailyExpenseMutationKey,
    mutationFn: async ({
      input,
    }: {
      input: { amount: number; description?: string | null };
      periodStart: string;
      periodEnd: string;
    }) => {
      await api.post(`/reports/${reportId}/daily-expenses`, {
        amount: input.amount,
        description: input.description ?? null,
      });
    },
    onMutate: async ({ input, periodStart, periodEnd }) => {
      const key = operationsQueryKey(reportId, 'daily');
      const previous = queryClient.getQueryData<Operation[]>(key) ?? [];

      const date = getNextFreeDate(
        previous.map((op) => op.date ?? ''),
        periodStart,
        periodEnd,
      );
      if (!date) return undefined;

      const now = new Date().toISOString();
      const optimistic: Operation & OptimisticItem = {
        id: createOptimisticId(),
        report_id: reportId,
        user_id: user?.id ?? '',
        type: 'daily',
        amount: String(input.amount),
        category_id: null,
        description: trimStrings(input.description ?? null),
        date,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(operationsQueryKey(reportId, 'daily'), context.previous);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
