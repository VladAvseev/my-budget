import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { Account } from '@/shared/api/types/domain';
import { invalidateAccounts } from './invalidateAccounts';

export type UseUpdateAccountRequest = {
  id: string;
  name?: string;
  initial_balance?: string;
  color?: string | null;
  is_closed?: boolean;
  is_primary?: true;
};
export type UseUpdateAccountResponse = Account;

export const useUpdateAccount = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UseUpdateAccountRequest) =>
      api.patch<UseUpdateAccountResponse>(`/accounts/${id}`, body),
    onSuccess: () => invalidateAccounts(client, userId),
  });
};
