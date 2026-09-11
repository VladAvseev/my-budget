import { useAuth } from '@/shared/api/authProvider';
import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { getNextFreeDate } from '@/shared/utils/date';
import { trimStrings } from '@/shared/utils';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { operationsQueryKey } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /reports/:id/daily-expenses: сервер сам
 * ищет первую свободную дату периода отчёта (по своей копии периода —
 * надёжнее, чем аргументы клиента; periodStart/periodEnd в сигнатуре
 * оставлены для оптимистичной даты в кэше).
 */
const createDailyExpenseMutationKey = ['createDailyExpense'] as const;

/** Payload модалки (прежний DailyExpenseInput без categoryId — он серверу не нужен). */
export interface UseCreateDailyExpenseRequest {
  input: {
    amount: number;
    description?: string | null;
  };
  /** Только для оптимистичной даты в кэше, на сервер не уходит. */
  periodStart: string;
  periodEnd: string;
}

/** Ответ POST /reports/:id/daily-expenses — созданная daily-операция (201). */
export type UseCreateDailyExpenseResponse = Operation;

/** Тело на проводе. */
interface CreateDailyExpenseBody {
  amount: number;
  description: string | null;
}

export const useCreateDailyExpense = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createDailyExpenseMutationKey,
    mutationFn: async ({ input }: UseCreateDailyExpenseRequest) => {
      const body: CreateDailyExpenseBody = {
        amount: input.amount,
        description: input.description ?? null,
      };
      return api.post<UseCreateDailyExpenseResponse>(`/reports/${reportId}/daily-expenses`, body);
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

      const summaryPrevious = applySummaryDelta(queryClient, reportId, {
        add: { type: 'daily', amount: input.amount },
      });

      const now = new Date().toISOString();
      const optimistic: Operation & OptimisticItem = {
        id: createOptimisticId(),
        report_id: reportId,
        user_id: user?.id ?? '',
        type: 'daily',
        amount: input.amount,
        category_id: null,
        description: trimStrings(input.description ?? null),
        date,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous, summaryPrevious };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(operationsQueryKey(reportId, 'daily'), context.previous);
      restoreSummary(queryClient, reportId, context.summaryPrevious);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
