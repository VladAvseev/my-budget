import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDisableDailyExpenses = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('disable_daily_expenses', { p_report_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'operations'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
    },
  });
};