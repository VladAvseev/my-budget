import type { useQueryClient } from '@tanstack/react-query';

export const invalidateReportCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'operations'] });
  queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'summary'] });
  queryClient.invalidateQueries({ queryKey: ['userSummary'] });
  queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
};