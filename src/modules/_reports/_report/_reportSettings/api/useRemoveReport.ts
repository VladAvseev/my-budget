import { reportsService, type Report } from '@/shared/supabase/services/reports';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeReportMutationKey = ['removeReport'] as const;

export const useRemoveReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeReportMutationKey,
    mutationFn: () => reportsService.removeReport(id),
    onMutate: async () => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      queryClient.setQueryData<Report[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
  });
};