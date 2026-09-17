import { capitalDynamicsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import type { useQueryClient } from '@tanstack/react-query';

export const invalidateReportCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'operations'] });
  
  
  queryClient.invalidateQueries({ queryKey: ['userSummary'] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
  queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
  queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
  
  
  queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
  invalidateHomeCaches(queryClient);
};
