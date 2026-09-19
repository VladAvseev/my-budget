import type { Category } from '@/shared/api/types/domain';
import type { OperationType } from '@/shared/api/types/domain';
import { emptyAmounts, type OperationAmounts } from '@/shared/utils';
import { formatMonthTitle } from '@/shared/utils';
import type { CategorySummaryRow } from '../api/useOverviewCategorySummary';

export interface ChartSegment {
  key: string;
  label: string;
  color: string;
  total: number;
  percent: number;
  start: number;
  end: number;
}

export interface ChartData {
  segments: ChartSegment[];
  total: number;
  hasNegative: boolean;
}

export interface MonthAmount {
  month: string;
  label: string;
  amount: number;
}

export type ReportAmount = MonthAmount;

export interface CategoryGroup {
  key: string;
  category: Category | null;
  label: string;
  color?: string;
  total: number;
  byReport: MonthAmount[];
}

const emptyReportBreakdown = new Map<string, number>();

const summaryAmount = (row: CategorySummaryRow): number => Number(row.amount) || 0;

export const sumCategorySummary = (
  summaryByMonth: Map<string, CategorySummaryRow[]>,
): OperationAmounts => {
  const total = { ...emptyAmounts };
  for (const rows of summaryByMonth.values()) {
    for (const row of rows) {
      const type = row.type as OperationType;
      const amount = Number(row.amount) || 0;
      if (type === 'income' || type === 'expense') {
        total[type as keyof OperationAmounts] += amount;
      }
    }
  }
  return total;
};

export const buildReportGroups = (
  months: string[],
  summaryByMonth: Map<string, CategorySummaryRow[]>,
  typeFilter: OperationType[],
): MonthAmount[] => {
  const result: MonthAmount[] = [];
  for (const month of months) {
    const rows = summaryByMonth.get(month) ?? [];
    const amount = rows.reduce((sum, row) => {
      if (!typeFilter.includes(row.type as OperationType)) return sum;
      return sum + summaryAmount(row);
    }, 0);
    if (amount !== 0) {
      result.push({ month, label: formatMonthTitle(month), amount });
    }
  }
  return result;
};

export const buildCategoryGroups = (
  months: string[],
  summaryByMonth: Map<string, CategorySummaryRow[]>,
  categories: Category[],
  typeFilter: OperationType[],
): CategoryGroup[] => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const totalsByKey = new Map<string, number>();
  const byMonthByKey = new Map<string, Map<string, number>>();

  const add = (key: string, month: string, amount: number) => {
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + amount);
    const monthMap = byMonthByKey.get(key) ?? new Map<string, number>();
    monthMap.set(month, (monthMap.get(month) ?? 0) + amount);
    byMonthByKey.set(key, monthMap);
  };

  for (const [month, rows] of summaryByMonth) {
    for (const row of rows) {
      if (!typeFilter.includes(row.type as OperationType)) continue;
      add(row.category_id ?? 'none', month, summaryAmount(row));
    }
  }

  const toMonthAmounts = (key: string): MonthAmount[] => {
    const amounts = byMonthByKey.get(key) ?? emptyReportBreakdown;
    const result: MonthAmount[] = [];
    for (const month of months) {
      const amount = amounts.get(month);
      if (amount) {
        result.push({ month, label: formatMonthTitle(month), amount });
      }
    }
    return result;
  };

  const groups: CategoryGroup[] = [];
  for (const category of categories) {
    const key = category.id;
    groups.push({
      key,
      category: categoryById.get(key) ?? null,
      label: category.name,
      color: category.color ?? undefined,
      total: totalsByKey.get(key) ?? 0,
      byReport: toMonthAmounts(key),
    });
  }
  groups.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  if (totalsByKey.has('none')) {
    groups.push({
      key: 'none',
      category: null,
      label: 'Без категории',
      total: totalsByKey.get('none') ?? 0,
      byReport: toMonthAmounts('none'),
    });
  }
  return groups;
};

export const buildChartData = (
  summaryByMonth: Map<string, CategorySummaryRow[]>,
  typeFilter: OperationType[],
  categories: Category[],
): ChartData => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const totalsByKey = new Map<string, number>();

  const add = (key: string, amount: number) => {
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + amount);
  };

  for (const rows of summaryByMonth.values()) {
    for (const row of rows) {
      if (!typeFilter.includes(row.type as OperationType)) continue;
      add(row.category_id ?? 'none', summaryAmount(row));
    }
  }

  const hasNegative = [...totalsByKey.values()].some((total) => total < 0);
  const total = [...totalsByKey.values()].reduce((sum, v) => sum + v, 0);

  if (total <= 0 || hasNegative) {
    return { segments: [], total, hasNegative: true };
  }

  const segments: ChartSegment[] = [];
  let cursor = 0;
  const sortedEntries = [...totalsByKey.entries()].sort((a, b) => b[1] - a[1]);

  for (const [key, value] of sortedEntries) {
    const percent = (value / total) * 100;
    let label: string;
    let color: string;

    if (key === 'none') {
      label = 'Без категории';
      color = 'var(--md-sys-color-outline-variant)';
    } else {
      const category = categoryById.get(key);
      label = category?.name ?? 'Неизвестная';
      color = category?.color ?? 'var(--md-sys-color-outline-variant)';
    }

    segments.push({
      key,
      label,
      color,
      total: value,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  }

  return { segments, total, hasNegative: false };
};
