import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { Account } from '@/shared/api/types/domain';
import { invalidateAccounts } from './invalidateAccounts';

export type UseCreateAccountRequest = {
  name: string;
  initial_balance: string;
  color?: string | null;
};
export type UseCreateAccountResponse = Account;

export const useCreateAccount = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UseCreateAccountRequest) =>
      api.post<UseCreateAccountResponse>('/accounts', input),
    onSuccess: () => invalidateAccounts(client, userId),
  });
};
