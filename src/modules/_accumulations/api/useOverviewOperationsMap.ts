import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Карта «отчёт → операции» для графиков роста на странице накоплений:
 * GET /operations?reportIds= — ответ содержит только
 * report_id/type/amount/category_id — типизация
 * Operation[] сохранена для совместимости с потребителями.
 */
const overviewOperationsQueryKey = (reportIds: string[]) =>
  ['overview', 'operations', [...reportIds].sort().join('|')] as const;

/** Фильтр запроса: id отчётов (уходят в query `reportIds`). */
export type UseOverviewOperationsMapRequest = string[];

/** Данные хука: карта report_id → операции выбранного отчёта. */
export type UseOverviewOperationsMapResponse = Map<string, Operation[]>;

export const useOverviewOperationsMap = (reportIds: UseOverviewOperationsMapRequest) =>
  useQuery<UseOverviewOperationsMapResponse>({
    queryKey: overviewOperationsQueryKey(reportIds),
    enabled: reportIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const operations =
        (await api.get<Operation[]>(`/operations?reportIds=${reportIds.join(',')}`, {
          signal,
        })) ?? [];
      const map = new Map<string, Operation[]>();
      for (const operation of operations) {
        const list = map.get(operation.report_id) ?? [];
        list.push(operation);
        map.set(operation.report_id, list);
      }
      return map;
    },
  });
