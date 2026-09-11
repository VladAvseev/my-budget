import { api } from '@/shared/api/http';
import type { Operation, OperationType } from '@/shared/api/types/domain';
import type { OperationSummary } from '@/shared/api/hooks';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { applySummaryDelta, restoreSummary } from './applySummaryDelta';
import { invalidateReportCache } from './invalidateReportCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * PATCH /operations/:id. Отправляем только реально
 * заполненные поля: null в amount смысл иметь не может (NOT NULL), а
 * categoryId/description = null — легальное «очистить».
 */
const updateOperationMutationKey = ['updateOperation'] as const;

/** Запрос PATCH /operations/:id — id + payload модалки (прежний OperationUpdateInput). */
export interface UseUpdateOperationRequest {
  id: string;
  input: {
    type?: OperationType;
    amount?: number;
    categoryId?: string | null;
    description?: string | null;
    date?: string | null;
  };
}

/** Ответ PATCH /operations/:id — обновлённая операция (200). */
export type UseUpdateOperationResponse = Operation;

/** Тело на проводе (серверный UpdateOperationInput). */
interface UpdateOperationBody {
  amount?: number;
  categoryId?: string | null;
  description?: string | null;
  type?: OperationType;
  date?: string | null;
}

export const useUpdateOperation = (reportId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateOperationMutationKey,
    mutationFn: async ({ id, input }: UseUpdateOperationRequest) => {
      const body: UpdateOperationBody = {};
      if (input.amount !== undefined && input.amount !== null) body.amount = input.amount;
      if (input.categoryId !== undefined) body.categoryId = input.categoryId;
      if (input.description !== undefined) body.description = trimStrings(input.description);
      if (input.type !== undefined) body.type = input.type;
      if (input.date !== undefined) body.date = input.date;
      return api.patch<UseUpdateOperationResponse>(`/operations/${id}`, body);
    },
    onMutate: async ({ id, input }) => {
      const prefix = ['reports', reportId, 'operations'];
      const previous = queryClient.getQueriesData<Operation[]>({ queryKey: prefix });

      // Снимок сводки: убираем старый вклад операции и вносим новый.
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
                ...(input.amount !== undefined ? { amount: input.amount } : {}),
                ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
                ...(input.description !== undefined
                  ? { description: trimStrings(input.description) }
                  : {}),
                ...(input.date !== undefined ? { date: input.date } : {}),
                _optimistic: true,
              } as Operation & OptimisticItem)
            : item,
        ),
      );

      return { previous, summaryPrevious };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      for (const [cacheKey, cached] of context.previous) {
        if (cached !== undefined) {
          queryClient.setQueryData(cacheKey, cached);
        }
      }
      restoreSummary(queryClient, reportId, context.summaryPrevious);
    },
    onSettled: () => invalidateReportCache(queryClient, reportId),
  });
};
