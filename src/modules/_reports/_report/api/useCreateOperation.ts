import { useAuth } from '@/shared/supabase/authProvider';
import {
  operationsService,
  type Operation,
  type OperationInput,
} from '@/shared/supabase/services/operations';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { operationsQueryKey } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createOperationMutationKey = ['createOperation'] as const;

export const useCreateOperation = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createOperationMutationKey,
    mutationFn: (input: OperationInput) =>
      operationsService.createOperation(reportId, user?.id ?? '', input),
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
        description: input.description ?? null,
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