import type { OperationSummary } from '@/shared/api/hooks/useGlobalBalance';

/** Итоги общей сводки с учётом начального баланса. */
export interface GlobalTotals {
  income: number;
  expense: number;
  balance: number;
}

export const computeGlobalTotals = (
  startBalance: number,
  summary: OperationSummary | undefined,
): GlobalTotals => {
  const s = summary ?? { income: 0, expense: 0, daily: 0 };
  const income = s.income + startBalance;
  const expense = s.expense + s.daily;
  return { income, expense, balance: income - expense };
};
