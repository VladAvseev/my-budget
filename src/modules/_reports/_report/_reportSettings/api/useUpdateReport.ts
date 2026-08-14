import { reportsService, type ReportUpdateInput } from '@/shared/supabase/services/reports';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReportUpdateInput) => reportsService.updateReport(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};