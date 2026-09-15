import { useAuth } from '@/shared/api/authProvider';
import { api } from '@/shared/api/http';
import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { operationsKeyForType } from './keys';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /operations: reportId уходит в теле,
 * user_id сервер берёт из JWT. Привязку к счетам проверяет сервер.
 */
const createOperationMutationKey = ['createOperation'] as const;

/** Запрос POST /operations — payload модалки (прежний OperationInput). */
export type UseCreateOperationRequest = {
  amount: number;
  description?: string | null;
  date?: string | null;
} & (
  | {
      type: 'transfer';
      from_account_id: string;
      to_account_id: string;
      categoryId?: never;
      account_id?: never;
    }
  | {
      type: Exclude<ApiOperationType, 'transfer'>;
      account_id: string;
      categoryId?: string | null;
      from_account_id?: never;
      to_account_id?: never;
    }
);

/** Ответ POST /operations — созданная операция (201). */
export type UseCreateOperationResponse = Operation;

/** Тело на проводе (серверный CreateOperationInput). */
type CreateOperationBody = UseCreateOperationRequest & { reportId: string };

export const useCreateOperation = (reportId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: createOperationMutationKey,
    mutationFn: async (input: UseCreateOperationRequest) => {
      const body: CreateOperationBody = {
        reportId,
        amount: input.amount,
        ...(input.type === 'transfer'
          ? {
              type: input.type,
              from_account_id: input.from_account_id,
              to_account_id: input.to_account_id,
            }
          : {
              type: input.type,
              account_id: input.account_id,
              categoryId: input.categoryId ?? null,
            }),
        description: input.description ?? null,
        date: input.date ?? null,
      };
      return api.post<UseCreateOperationResponse>('/operations', body);
    },
    onMutate: async (input) => {
      const key = operationsKeyForType(reportId, input.type);
      await queryClient.cancelQueries({ queryKey: key, exact: true });
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
        account_id: input.type === 'transfer' ? null : input.account_id,
        from_account_id: input.type === 'transfer' ? input.from_account_id : null,
        to_account_id: input.type === 'transfer' ? input.to_account_id : null,
        amount: input.amount,
        category_id: input.type === 'transfer' ? null : (input.categoryId ?? null),
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
