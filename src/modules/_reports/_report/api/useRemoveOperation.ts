import { supabase } from '@/shared/supabase/supabase';
import type { Operation } from '@/shared/supabase/types/domain';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeOperationMutationKey = ['removeOperation'] as const;

export const useRemoveOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeOperationMutationKey,
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_operation', { p_id: id });
      if (error) throw error;
    },
    onMutate: async (id) => {
      const prefix = ['reports', reportId, 'operations'];
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items) =>
        (items ?? []).filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        }
      }
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};