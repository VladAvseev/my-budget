import { api } from '@/shared/api/http';
import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UseCreateOperationRequest = {
  amount: number;
  description?: string | null;
  date: string;
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

export type UseCreateOperationResponse = Operation;

export const useCreateOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createOperation'],
    mutationFn: async (input: UseCreateOperationRequest) =>
      api.post<UseCreateOperationResponse>('/operations', {
        type: input.type,
        amount: input.amount,
        description: trimStrings(input.description ?? null),
        date: input.date,
        ...(input.type === 'transfer'
          ? {
              from_account_id: input.from_account_id,
              to_account_id: input.to_account_id,
            }
          : {
              account_id: input.account_id,
              categoryId: input.categoryId ?? null,
            }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
  });
};
