import { useMonthCategorySummary } from '@/shared/api/hooks/useMonthCategorySummary';
import type { OperationSummary } from '@/shared/api/hooks/useGlobalBalance';
import { useMemo } from 'react';

export type UseSummaryRequest = string;

export type UseSummaryResponse = OperationSummary;

export const useSummary = (month: UseSummaryRequest) => {
  const query = useMonthCategorySummary(month ? [month] : []);
  const data = useMemo<OperationSummary | undefined>(() => {
    if (!month || query.data == null) return query.data == null ? undefined : { income: 0, expense: 0 };
    const rows = query.data.get(month) ?? [];
    let income = 0;
    let expense = 0;
    for (const row of rows) {
      if (row.type === 'income') income += Number(row.amount) || 0;
      else if (row.type === 'expense') expense += Number(row.amount) || 0;
    }
    return { income, expense };
  }, [month, query.data]);
  return { ...query, data };
};
