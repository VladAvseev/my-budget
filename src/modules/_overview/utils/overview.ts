import type { Category } from '@/shared/supabase/types/domain';
import { signedOperationAmount, type Operation, type OperationType } from '@/shared/supabase/types/domain';
import type { Report } from '@/shared/supabase/types/domain';

export interface OperationAmounts {
  income: number;
  expense: number;
  savings: number;
  daily: number;
}

export const emptyAmounts: OperationAmounts = { income: 0, expense: 0, savings: 0, daily: 0 };

export const sumOperations = (operations: Operation[]): OperationAmounts => {
  const total: OperationAmounts = { ...emptyAmounts };
  for (const operation of operations) {
    const type = operation.type as OperationType;
    const amount = Number(operation.amount) || 0;
    if (type === 'savings_out') {
      total.savings -= amount;
    } else if (type in total) {
      total[type as keyof OperationAmounts] += amount;
    }
  }
  return total;
};

export const percentOfIncome = (value: number, income: number) =>
  income > 0 ? Math.round((value / income) * 100) : null;

export interface ReportAmount {
  report: Report;
  amount: number;
}

export interface CategoryGroup {
  key: string;
  category: Category | null;
  label: string;
  color?: string;
  total: number;
  byReport: ReportAmount[];
}

const emptyReportBreakdown = new Map<string, number>();

export const buildReportGroups = (
  reports: Report[],
  operationsByReport: Map<string, Operation[]>,
  typeFilter: OperationType[],
): ReportAmount[] => {
  const result: ReportAmount[] = [];
  for (const report of reports) {
    const operations = operationsByReport.get(report.id) ?? [];
    const amount = operations.reduce((sum, operation) => {
      if (!typeFilter.includes(operation.type as OperationType)) return sum;
      return sum + signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);
    }, 0);
    if (amount !== 0) {
      result.push({ report, amount });
    }
  }
  return result;
};

export const buildCategoryGroups = (
  reports: Report[],
  operationsByReport: Map<string, Operation[]>,
  categories: Category[],
  typeFilter: OperationType[],
): CategoryGroup[] => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const totalsByKey = new Map<string, number>();
  const byReportByKey = new Map<string, Map<string, number>>();

  const add = (key: string, reportId: string, amount: number) => {
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + amount);
    const reportMap = byReportByKey.get(key) ?? new Map<string, number>();
    reportMap.set(reportId, (reportMap.get(reportId) ?? 0) + amount);
    byReportByKey.set(key, reportMap);
  };

  for (const [reportId, operations] of operationsByReport) {
    for (const operation of operations) {
      if (!typeFilter.includes(operation.type as OperationType)) continue;
      const amount = signedOperationAmount(
        operation.type as OperationType,
        Number(operation.amount) || 0,
      );
      add(operation.category_id ?? 'none', reportId, amount);
    }
  }

  const toReportAmounts = (key: string): ReportAmount[] => {
    const amounts = byReportByKey.get(key) ?? emptyReportBreakdown;
    const result: ReportAmount[] = [];
    for (const report of reports) {
      const amount = amounts.get(report.id);
      if (amount) {
        result.push({ report, amount });
      }
    }
    return result;
  };

  const groups: CategoryGroup[] = [];
  for (const category of categories) {
    const key = category.id;
    if (!totalsByKey.has(key)) continue;
    groups.push({
      key,
      category: categoryById.get(key) ?? null,
      label: category.name,
      color: category.color ?? undefined,
      total: totalsByKey.get(key) ?? 0,
      byReport: toReportAmounts(key),
    });
  }
  if (totalsByKey.has('none')) {
    groups.push({
      key: 'none',
      category: null,
      label: 'Без категории',
      total: totalsByKey.get('none') ?? 0,
      byReport: toReportAmounts('none'),
    });
  }
  return groups;
};
