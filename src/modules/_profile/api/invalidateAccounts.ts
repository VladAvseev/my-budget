import type { QueryClient } from '@tanstack/react-query';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { accountsQueryKey } from './keys';

export const invalidateAccounts = async (client: QueryClient, userId: string) => {
  invalidateHomeCaches(client);
  await Promise.all([
    client.invalidateQueries({ queryKey: accountsQueryKey(userId) }),
    client.invalidateQueries({ queryKey: ['profile', userId] }),
    client.invalidateQueries({ queryKey: ['userSummary'] }),
  ]);
};
