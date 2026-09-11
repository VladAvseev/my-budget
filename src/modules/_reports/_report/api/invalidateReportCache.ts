import {
  capitalDynamicsQueryKey,
  growthDynamicsQueryKey,
  invalidateHomeCaches,
} from '@/shared/api/hooks';
import type { useQueryClient } from '@tanstack/react-query';

export const invalidateReportCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'operations'] });
  // summary локальной сводки не инвалидируем: мутации операций двигают её
  // оптимистично (см. applySummaryDelta), глобальные сводки — рефетчатся.
  queryClient.invalidateQueries({ queryKey: ['userSummary'] });
  queryClient.invalidateQueries({ queryKey: ['savingsOperations'] });
  queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
  queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
  // Помесячная динамика роста на странице накоплений считается сервером из
  // savings/savings_out-операций отчётов — любые правки операций её двигают.
  queryClient.invalidateQueries({ queryKey: growthDynamicsQueryKey, exact: true });
  // Динамика капитала на главной считается сервером из income/expense/daily —
  // любые правки операций и периодов отчётов её двигают.
  queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
  invalidateHomeCaches(queryClient);
};
