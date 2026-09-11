import { useAuth } from '@/shared/api/authProvider';
import { api } from '@/shared/api/http';
import type { Operation, OperationType } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { operationsKeyForType } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /operations: reportId уходит в теле,
 * user_id сервер берёт из JWT. Проверка своей savings-категории — на сервере.
 */
const createOperationMutationKey = ['createOperation'] as const;

/** Запрос POST /operations — payload модалки (прежний OperationInput). */
export interface UseCreateOperationRequest {
  type: OperationType;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  date?: string | null;
}

/** Ответ POST /operations — созданная операция (201). */
export type UseCreateOperationResponse = Operation;

/** Тело на проводе (серверный CreateOperationInput). */
interface CreateOperationBody {
  reportId: string;
  type: OperationType;
  amount: number;
  categoryId: string | null;
  description: string | null;
  date: string | null;
}

export const useCreateOperation = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createOperationMutationKey,
    mutationFn: async (input: UseCreateOperationRequest) => {
      const body: CreateOperationBody = {
        reportId,
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId ?? null,
        description: input.description ?? null,
        date: input.date ?? null,
      };
      return api.post<UseCreateOperationResponse>('/operations', body);
    },
    onMutate: async (input) => {
      const key = operationsKeyForType(reportId, input.type);
      const previous = queryClient.getQueryData<Operation[]>(key) ?? [];
      const summaryPrevious = applySummaryDelta(queryClient, reportId, {
        add: { type: input.type, amount: input.amount },
      });

      const now = new Date().toISOString();
      const optimistic: Operation & OptimisticItem = {
        id: createOptimisticId(),
        report_id: reportId,
        user_id: user?.id ?? '',
        type: input.type,
        amount: input.amount,
        category_id: input.categoryId ?? null,
        description: trimStrings(input.description ?? null),
        date: input.date ?? null,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous, summaryPrevious, key };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(context.key, context.previous);
      restoreSummary(queryClient, reportId, context.summaryPrevious);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
