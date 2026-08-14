import { reportsService } from '@/shared/supabase/services/reports';
import { operationsService } from '@/shared/supabase/services/operations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDisableDailyExpenses = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await operationsService.removeDailyExpenses(id);
      const { error } = await reportsService.updateReport(id, { hasDailyExpenses: false });
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