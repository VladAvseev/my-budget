import { capitalDynamicsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
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
  // Динамика капитала в аналитике считается сервером из income/expense
  // операций отчётов — любые правки операций её двигают.
  queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
  invalidateHomeCaches(queryClient);
};
