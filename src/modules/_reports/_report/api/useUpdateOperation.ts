import { api } from '@/shared/api/http';
import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import type { OperationSummary } from '@/shared/api/hooks';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { invalidateReportCache } from './invalidateReportCache';
import { operationsKeyForType } from './keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateOperationMutationKey = ['updateOperation'] as const;

export interface UseUpdateOperationRequest {
  id: string;
  input: {
    type?: ApiOperationType;
    account_id?: string;
    from_account_id?: string;
    to_account_id?: string;
    amount?: number;
    categoryId?: string | null;
    description?: string | null;
    date?: string | null;
  };
}

export type UseUpdateOperationResponse = Operation;

interface UpdateOperationBody {
  amount?: number;
  categoryId?: string | null;
  description?: string | null;
  type?: ApiOperationType;
  account_id?: string;
  from_account_id?: string;
  to_account_id?: string;
  date?: string | null;
}

export const useUpdateOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateOperationMutationKey,
    mutationFn: async ({ id, input }: UseUpdateOperationRequest) => {
      const body: UpdateOperationBody = {};
      if (input.amount !== undefined && input.amount !== null) body.amount = input.amount;
      if (input.type !== 'transfer' && input.categoryId !== undefined)
        body.categoryId = input.categoryId;
      if (input.type === 'transfer') {
        if (input.from_account_id !== undefined) body.from_account_id = input.from_account_id;
        if (input.to_account_id !== undefined) body.to_account_id = input.to_account_id;
      } else if (input.account_id !== undefined) body.account_id = input.account_id;
      if (input.description !== undefined) body.description = trimStrings(input.description);
      if (input.type !== undefined) body.type = input.type;
      if (input.date !== undefined) body.date = input.date;
      return api.patch<UseUpdateOperationResponse>(`/operations/${id}`, body);
    },
    onMutate: async ({ id, input }) => {
      const prefix = ['reports', reportId, 'operations'];
      await queryClient.cancelQueries({ queryKey: prefix });
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      const oldOperation = previous
        .flatMap(([, items]) => items ?? [])
        .find((item) => item.id === id);
      let summaryPrevious: OperationSummary | undefined;
      if (oldOperation) {
        const oldAmount = Number(oldOperation.amount) || 0;
        const newType = input.type ?? oldOperation.type;
        const newAmount = input.amount ?? oldAmount;
        summaryPrevious = applySummaryDelta(queryClient, reportId, {
          remove: { type: oldOperation.type, amount: oldAmount },
          add: { type: newType, amount: newAmount },
        });
      }

      queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.type !== undefined ? { type: input.type } : {}),
                ...(input.account_id !== undefined ? { account_id: input.account_id } : {}),
                ...(input.from_account_id !== undefined
                  ? { from_account_id: input.from_account_id }
                  : {}),
                ...(input.to_account_id !== undefined
                  ? { to_account_id: input.to_account_id }
                  : {}),
                ...(input.amount !== undefined ? { amount: input.amount } : {}),
                ...(input.type === 'transfer'
                  ? { category_id: null }
                  : input.categoryId !== undefined
                    ? { category_id: input.categoryId }
                    : {}),
                ...(input.description !== undefined
                  ? { description: trimStrings(input.description) }
                  : {}),
                ...(input.date !== undefined ? { date: input.date } : {}),
                _optimistic: true,
              } as Operation & OptimisticItem)
            : item,
        ),
      );

      if (oldOperation && input.type && input.type !== oldOperation.type) {
        const updated = queryClient
          .getQueriesData<Operation[]>({ queryKey: prefix })
          .flatMap(([, items]) => items ?? [])
          .find((item) => item.id === id);
        if (updated) {
          const targetKey = operationsKeyForType(reportId, input.type);
          if (!previous.some(([key]) => JSON.stringify(key) === JSON.stringify(targetKey))) {
            previous.push([targetKey, undefined]);
          }
          queryClient.setQueriesData<Operation[]>({ queryKey: prefix }, (items = []) =>
            items.filter((item) => item.id !== id),
          );
          queryClient.setQueryData<Operation[]>(targetKey, (items = []) => [updated, ...items]);
        }
      }

      return { previous, summaryPrevious };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        } else {
          queryClient.removeQueries({ queryKey: cacheKey, exact: true });
        }
      }
      restoreSummary(queryClient, reportId, context.summaryPrevious);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
