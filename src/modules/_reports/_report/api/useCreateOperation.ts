import { useAuth } from '@/shared/supabase/authProvider';
import { supabase } from '@/shared/supabase/supabase';
import type { Operation, OperationInput } from '@/shared/supabase/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { operationsQueryKey } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createOperationMutationKey = ['createOperation'] as const;

export const useCreateOperation = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createOperationMutationKey,
    mutationFn: async (input: OperationInput) => {
      const { error } = await supabase.rpc('create_operation', {
        p_report_id: reportId,
        p_type: input.type,
        p_amount: input.amount,
        p_category_id: input.categoryId ?? null,
        p_description: input.description ?? null,
        p_date: input.date ?? null,
      });
      if (error) throw error;
    },
    onMutate: async (input) => {
      const key = operationsQueryKey(reportId, input.type);
      const previous = queryClient.getQueryData<Operation[]>(key) ?? [];

      const now = new Date().toISOString();
      const optimistic: Operation & OptimisticItem = {
        id: createOptimisticId(),
        report_id: reportId,
        user_id: user?.id ?? '',
        type: input.type,
        amount: String(input.amount),
        category_id: input.categoryId ?? null,
        description: trimStrings(input.description ?? null),
        date: input.date ?? null,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(operationsQueryKey(reportId, _input.type), context.previous);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};