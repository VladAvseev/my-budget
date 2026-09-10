import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Карта «отчёт → операции» для распределения по категориям в overview:
 * GET /operations?reportIds= — ответ содержит только
 * report_id/type/amount/category_id — типизация
 * Operation[] сохранена для совместимости с потребителями.
 */
const overviewOperationsQueryKey = (reportIds: string[]) =>
  ['overview', 'operations', [...reportIds].sort().join('|')] as const;

export const useOverviewOperationsMap = (reportIds: string[]) =>
  useQuery<Map<string, Operation[]>>({
    queryKey: overviewOperationsQueryKey(reportIds),
    enabled: reportIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const operations =
        (await api.get<Operation[]>(`/operations?reportIds=${reportIds.join(',')}`)) ?? [];
      const map = new Map<string, Operation[]>();
      for (const operation of operations) {
        const list = map.get(operation.report_id) ?? [];
        list.push(operation);
        map.set(operation.report_id, list);
      }
      return map;
    },
  });
