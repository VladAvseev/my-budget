import { invalidateHomeCaches } from '@/shared/api/hooks';
import type { useQueryClient } from '@tanstack/react-query';

export const invalidateReportCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'operations'] });
  // summary локальной сводки не инвалидируем: мутации операций двигают её
  // оптимистично (см. applySummaryDelta), глобальные сводки — рефетчатся.
  queryClient.invalidateQueries({ queryKey: ['userSummary'] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
  queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
  queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
  invalidateHomeCaches(queryClient);
};
