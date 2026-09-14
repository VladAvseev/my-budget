import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import { invalidateAccounts } from './invalidateAccounts';

export type UseRemoveAccountRequest = string;
export type UseRemoveAccountResponse = void;

export const useRemoveAccount = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: UseRemoveAccountRequest) =>
      api.del<UseRemoveAccountResponse>(`/accounts/${id}`),
    onSuccess: () => invalidateAccounts(client, userId),
  });
};
