import type { OperationSummary } from '@/shared/api/types/domain';

/**
 * Единая формула глобальных итогов (сайдбар «Капитал/Баланс» и карточка
 * «Аналитика» на главной). 
 */
export interface GlobalTotals {
  /** «Доходы»: сводка + начальный баланс + начальные накопления. */
  income: number;
  /** «Расходы»: сводка + дневные расходы. */
  expense: number;
  /** «Накопления»: переводы в накопления + начальные накопления. */
  savings: number;
  /** «Баланс»: доходы минус расходы минус накопления. */
  balance: number;
  /** «Капитал»: баланс плюс накопления = доходы минус расходы. */
  capital: number;
}

/**
 * initialSavings — сумма начальных накоплений;
 */
export const computeGlobalTotals = (
  startBalance: number,
  summary: OperationSummary | undefined,
  initialSavings: number,
): GlobalTotals => {
  const s = summary ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const income = s.income + startBalance + initialSavings;
  const expense = s.expense + s.daily;
  const savings = s.savings + initialSavings;
  const balance = income - expense - savings;
  return { income, expense, savings, balance, capital: income - expense };
};
