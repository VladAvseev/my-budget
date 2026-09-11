import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Строка серверной сводки GET /operations/category-summary: сумма операций
 * одного отчёта по типу и категории.
 */
export interface CategorySummaryRow {
  report_id: string;
  type: string;
  amount: number;
  category_id: string | null;
}

/**
 * Карта «отчёт → сводка по категориям» для аналитики overview: вместо сырых
 * операций тянем только сгруппированные сервером суммы.
 */
const overviewCategorySummaryQueryKey = (reportIds: string[]) =>
  ['overview', 'category-summary', [...reportIds].sort().join('|')] as const;

/** Фильтр запроса: id отчётов (уходят в query `reportIds`). */
export type UseOverviewCategorySummaryRequest = string[];

/** Данные хука: карта report_id → строки сводки выбранного отчёта. */
export type UseOverviewCategorySummaryResponse = Map<string, CategorySummaryRow[]>;

export const useOverviewCategorySummary = (reportIds: UseOverviewCategorySummaryRequest) =>
  useQuery<UseOverviewCategorySummaryResponse>({
    queryKey: overviewCategorySummaryQueryKey(reportIds),
    enabled: reportIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const rows =
        (await api.get<CategorySummaryRow[]>(
          `/operations/category-summary?reportIds=${reportIds.join(',')}`,
          { signal },
        )) ?? [];
      const map = new Map<string, CategorySummaryRow[]>();
      for (const row of rows) {
        const list = map.get(row.report_id) ?? [];
        list.push(row);
        map.set(row.report_id, list);
      }
      return map;
    },
  });
