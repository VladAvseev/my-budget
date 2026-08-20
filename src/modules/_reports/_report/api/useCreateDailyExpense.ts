import { useAuth } from '@/shared/supabase/authProvider';
import { supabase } from '@/shared/supabase/supabase';
import type { Operation } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { parseISO, toISODate } from '@/shared/utils/date';
import { trimStrings } from '@/shared/utils';
import { operationsQueryKey } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createDailyExpenseMutationKey = ['createDailyExpense'] as const;

const getNextFreeDate = (
  operations: Operation[],
  periodStart: string,
  periodEnd: string,
): string | null => {
  const start = parseISO(periodStart);
  const end = parseISO(periodEnd);
  if (!start || !end || start.getTime() > end.getTime()) return null;

  const used = new Set((operations ?? []).map((operation) => operation.date ?? '').filter(Boolean));
  const day = new Date(start);
  while (day.getTime() <= end.getTime()) {
    const iso = toISODate(day);
    if (!used.has(iso)) return iso;
    day.setDate(day.getDate() + 1);
  }
  return null;
};

export const useCreateDailyExpense = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createDailyExpenseMutationKey,
    mutationFn: async ({
      input,
      periodStart,
      periodEnd,
    }: {
      input: { amount: number; description?: string | null };
      periodStart: string;
      periodEnd: string;
    }) => {
      const { error } = await supabase.rpc('create_daily_expense', {
        p_report_id: reportId,
        p_amount: input.amount,
        p_description: input.description ?? null,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      });
      if (error) throw error;
    },
    onMutate: async ({ input, periodStart, periodEnd }) => {
      const key = operationsQueryKey(reportId, 'daily');
      const previous = queryClient.getQueryData<Operation[]>(key) ?? [];

      const date = getNextFreeDate(previous, periodStart, periodEnd);
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