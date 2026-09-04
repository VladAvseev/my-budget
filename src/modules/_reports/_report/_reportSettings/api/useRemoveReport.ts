import { supabase } from '@/shared/supabase/supabase';
import type { Report } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeReportMutationKey = ['removeReport'] as const;

export const useRemoveReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeReportMutationKey,
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_report', { p_id: id });
      if (error) throw error;
    },
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
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'operations'] });
    },
  });
};