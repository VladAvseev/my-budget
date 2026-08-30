import { supabase } from '@/shared/supabase/supabase';
import type { Report, ReportInput } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createReportMutationKey = ['createReport'] as const;

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createReportMutationKey,
    mutationFn: async (input: ReportInput) => {
      const { error } = await supabase.rpc('create_report', {
        p_name: input.name.trim(),
        p_code: input.code ?? '',
        p_has_daily_expenses: input.hasDailyExpenses ?? false,
        p_daily_budget: input.dailyBudget ?? null,
        p_period_start: input.periodStart ?? null,
        p_period_end: input.periodEnd ?? null,
      });
      if (error) throw error;
    },
    onMutate: async (input) => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      const now = new Date().toISOString();
      const hasDailyExpenses = input.hasDailyExpenses ?? false;
      const optimistic: Report & OptimisticItem = {
        id: createOptimisticId(),
        user_id: '',
        name: input.name,
        code: input.code ?? '',
        has_daily_expenses: hasDailyExpenses,
        daily_budget:
          hasDailyExpenses && input.dailyBudget != null ? String(input.dailyBudget) : null,
        period_start: hasDailyExpenses ? (input.periodStart ?? null) : null,
        period_end: hasDailyExpenses ? (input.periodEnd ?? null) : null,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};