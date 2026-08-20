import { supabase } from '@/shared/supabase/supabase';
import type { ReportUpdateInput } from '@/shared/supabase/types/domain';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReportUpdateInput) => {
      const { error } = await supabase.rpc('update_report', {
        p_id: id,
        p_name: input.name !== undefined ? trimStrings(input.name) : null,
        p_has_daily_expenses: input.hasDailyExpenses ?? null,
        p_daily_budget: input.dailyBudget ?? null,
        p_period_start: input.periodStart ?? null,
        p_period_end: input.periodEnd ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};