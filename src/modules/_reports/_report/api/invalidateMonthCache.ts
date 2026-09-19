import { capitalDynamicsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import type { QueryClient } from '@tanstack/react-query';

export const invalidateMonthCache = (queryClient: QueryClient, month: string) => {
  queryClient.invalidateQueries({ queryKey: ['operations', 'by-months', month] });
  queryClient.invalidateQueries({ queryKey: ['operations', 'category-summary', month] });
  queryClient.invalidateQueries({ queryKey: ['operations', 'months'] });
  queryClient.invalidateQueries({ queryKey: ['operations', 'category-summary'] });
  queryClient.invalidateQueries({ queryKey: ['operations'] });
  queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
  queryClient.invalidateQueries({ queryKey: ['userSummary'] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
  queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
  invalidateHomeCaches(queryClient);
};
