import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface MonthCategorySummaryRow {
  month: string;
  type: string;
  amount: number;
  category_id: string | null;
}

export const monthCategorySummaryQueryKey = (months: string[]) =>
  ['operations', 'category-summary', [...months].sort().join('|')] as const;

export type UseMonthCategorySummaryResponse = Map<string, MonthCategorySummaryRow[]>;

export const useMonthCategorySummary = (months: string[]) =>
  useQuery<UseMonthCategorySummaryResponse>({
    queryKey: monthCategorySummaryQueryKey(months),
    enabled: months.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const rows =
        (await api.get<MonthCategorySummaryRow[]>(
          `/operations/category-summary?months=${months.join(',')}`,
          { signal },
        )) ?? [];
      const map = new Map<string, MonthCategorySummaryRow[]>();
      for (const row of rows) {
        const list = map.get(row.month) ?? [];
        list.push(row);
        map.set(row.month, list);
      }
      return map;
    },
  });
