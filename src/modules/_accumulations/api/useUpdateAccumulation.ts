import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import {
  accumulationsTotalQueryKey,
  invalidateHomeCaches,
  type AccumulationsTotal,
} from '@/shared/api/hooks';
import { type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateAccumulationMutationKey = ['updateAccumulation'] as const;

/** Запрос PATCH /accumulations/:id — id + payload модалки (прежний AccumulationUpdateInput). */
export interface UseUpdateAccumulationRequest {
  id: string;
  input: {
    amount?: number;
    description?: string;
    categoryId?: string | null;
  };
}

/** Ответ PATCH /accumulations/:id — обновлённое накопление (200). */
export type UseUpdateAccumulationResponse = Accumulation;

/** Тело на проводе (серверный UpdateAccumulationInput). */
interface UpdateAccumulationBody {
  amount?: number;
  description?: string;
  categoryId?: string | null;
}

export const useUpdateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];
  const totalKey = accumulationsTotalQueryKey(userId);

  return useMutation({
    mutationKey: updateAccumulationMutationKey,
    mutationFn: async ({ id, input }: UseUpdateAccumulationRequest) => {
      const body: UpdateAccumulationBody = {};
      if (input.amount !== undefined) body.amount = input.amount;
      if (input.description !== undefined) body.description = trimStrings(input.description);
      if (input.categoryId !== undefined) body.categoryId = input.categoryId;
      return api.patch<UseUpdateAccumulationResponse>(`/accumulations/${id}`, body);
    },
    onMutate: async ({ id, input }) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];
      const previousTotal = queryClient.getQueryData<AccumulationsTotal>(totalKey);
      const delta =
        input.amount !== undefined
          ? (Number(input.amount) || 0) -
            (Number(previous.find((item) => item.id === id)?.amount) || 0)
          : 0;

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(input.amount !== undefined ? { amount: input.amount } : {}),
                ...(input.description !== undefined
                  ? { description: trimStrings(input.description) }
                  : {}),
                ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
                _optimistic: true,
              } as Accumulation & OptimisticItem)
            : item,
        ),
      );

      if (delta !== 0) {
        queryClient.setQueryData<AccumulationsTotal>(totalKey, (prev) => ({
          total: (prev?.total ?? 0) + delta,
        }));
      }

      return { previous, previousTotal, patchedTotal: delta !== 0 };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
      if (!context.patchedTotal) return;
      if (context.previousTotal === undefined) {
        queryClient.removeQueries({ queryKey: totalKey, exact: true });
      } else {
        queryClient.setQueryData(totalKey, context.previousTotal);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accumulations', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSummary', userId] });
      invalidateHomeCaches(queryClient);
    },
  });
};
