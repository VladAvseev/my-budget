import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import type { Account } from '@/shared/api/types/domain';

export const accountsQueryKey = (userId: string) => ['accounts', userId] as const;

export type UseAccountsResponse = Account[];

export const useAccounts = (userId: string) =>
  useQuery<UseAccountsResponse>({
    queryKey: [...accountsQueryKey(userId), 'all'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => api.get<UseAccountsResponse>('/accounts', { signal }),
  });
