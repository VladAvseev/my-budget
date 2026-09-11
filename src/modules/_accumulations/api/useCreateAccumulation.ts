import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import {
  accumulationsQueryKey,
  accumulationsTotalQueryKey,
  type AccumulationsTotal,
} from '@/shared/api/hooks';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleAccumulationMutation } from './cachePatches';

const createAccumulationMutationKey = ['createAccumulation'] as const;

/** Запрос POST /accumulations — payload модалки (прежний AccumulationInput). */
export interface UseCreateAccumulationRequest {
  amount: number;
  description: string;
  categoryId?: string | null;
}

/** Ответ POST /accumulations — созданное накопление (201). */
export type UseCreateAccumulationResponse = Accumulation;

/** Тело на проводе (серверный CreateAccumulationInput). */
interface CreateAccumulationBody {
  amount: number;
  description: string;
  categoryId: string | null;
}

export const useCreateAccumulation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createAccumulationMutationKey,
    mutationFn: async (input: UseCreateAccumulationRequest) => {
      const body: CreateAccumulationBody = {
        amount: input.amount,
        description: trimStrings(input.description),
        categoryId: input.categoryId ?? null,
      };
      return api.post<UseCreateAccumulationResponse>('/accumulations', body);
    },
    onMutate: async (input) => {
      const key = accumulationsQueryKey(userId);
      const totalKey = accumulationsTotalQueryKey(userId);
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];
      const previousTotal = queryClient.getQueryData<AccumulationsTotal>(totalKey);

      const now = new Date().toISOString();
      const optimisticId = createOptimisticId();
      const optimistic: (typeof previous)[number] & OptimisticItem = {
        id: optimisticId,
        user_id: userId,
        category_id: input.categoryId ?? null,
        description: input.description,
        amount: input.amount,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);
      // Дельта и на кэшированную сумму: capital сайдбара берётся из total-ключа.
      const delta = Number(input.amount) || 0;
      if (delta !== 0) {
        queryClient.setQueryData<AccumulationsTotal>(totalKey, (prev) => ({
          total: (prev?.total ?? 0) + delta,
        }));
      }

      return { previous, previousTotal, patchedTotal: delta !== 0, optimisticId };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      const totalKey = accumulationsTotalQueryKey(userId);
      queryClient.setQueryData(accumulationsQueryKey(userId), context.previous);
      if (!context.patchedTotal) return;
      if (context.previousTotal === undefined) {
        queryClient.removeQueries({ queryKey: totalKey, exact: true });
      } else {
        queryClient.setQueryData(totalKey, context.previousTotal);
      }
    },
    // Тихий settle: optimistic-строка замещается серверной, total и bootstrap
    // пересобираются на клиенте — refetch списка/суммы/главной не нужен.
    onSuccess: (created, _input, context) => {
      settleAccumulationMutation(queryClient, userId, {
        previous: null,
        next: created,
        optimisticId: context?.optimisticId,
      });
    },
  });
};
