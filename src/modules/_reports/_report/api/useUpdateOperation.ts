import { api } from '@/shared/api/http';
import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { trimStrings } from '@/shared/utils';
import { invalidateMonthCache } from './invalidateMonthCache';
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

export const useUpdateOperation = (month: string) => {
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
    onSettled: () => invalidateMonthCache(queryClient, month),
  });
};
