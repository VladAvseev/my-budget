import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface CategorySummaryRow {
  month: string;
  type: string;
  amount: number;
  category_id: string | null;
}

const overviewCategorySummaryQueryKey = (months: string[]) =>
  ['overview', 'category-summary', [...months].sort().join('|')] as const;

export type UseOverviewCategorySummaryRequest = string[];

export type UseOverviewCategorySummaryResponse = Map<string, CategorySummaryRow[]>;

export const useOverviewCategorySummary = (months: UseOverviewCategorySummaryRequest) =>
  useQuery<UseOverviewCategorySummaryResponse>({
    queryKey: overviewCategorySummaryQueryKey(months),
    enabled: months.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const rows =
        (await api.get<CategorySummaryRow[]>(
          `/operations/category-summary?months=${months.join(',')}`,
          { signal },
        )) ?? [];
      const map = new Map<string, CategorySummaryRow[]>();
      for (const row of rows) {
        const list = map.get(row.month) ?? [];
        list.push(row);
        map.set(row.month, list);
      }
      return map;
    },
  });
