import type { OperationSummary } from '@/shared/api/hooks';
import type { OperationType } from '@/shared/api/types/domain';
import type { useQueryClient } from '@tanstack/react-query';
import { summaryQueryKey } from './keys';

/**
 * Оптимистичный сдвиг сводки отчёта вместо refetch после мутаций операций.
 * Правило вклада зеркаляет FILTER-агрегат серверного getSummary
 * (server/src/modules/_reports/repository.ts): income/expense/daily —
 * прямые суммы, savings — savings минус savings_out.
 */

export interface SummaryOperationRef {
  type: OperationType | string;
  amount: number;
}

const ZERO: OperationSummary = { income: 0, expense: 0, savings: 0, daily: 0 };

const contribution = ({ type, amount }: SummaryOperationRef): OperationSummary => {
  const delta = { ...ZERO };
  switch (type) {
    case 'income':
      delta.income = amount;
      break;
    case 'expense':
      delta.expense = amount;
      break;
    case 'daily':
      delta.daily = amount;
      break;
    case 'savings':
      delta.savings = amount;
      break;
    case 'savings_out':
      delta.savings = -amount;
      break;
  }
  return delta;
};

const combine = (
  base: OperationSummary,
  add: OperationSummary,
  sub: OperationSummary,
): OperationSummary => ({
  income: base.income + add.income - sub.income,
  expense: base.expense + add.expense - sub.expense,
  savings: base.savings + add.savings - sub.savings,
  daily: base.daily + add.daily - sub.daily,
});

/**
 * Снимает вклад remove и вносит вклад add в закэшированную сводку.
 * Возвращает снимок сводки ДО изменения (для отката в onError) либо
 * undefined, если сводки в кэше нет — тогда и откатывать нечего.
 */
export const applySummaryDelta = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
  delta: { add?: SummaryOperationRef | null; remove?: SummaryOperationRef | null },
): OperationSummary | undefined => {
  const key = summaryQueryKey(reportId);
  const previous = queryClient.getQueryData<OperationSummary>(key);
  if (!previous) return undefined;
  queryClient.setQueryData<OperationSummary>(
    key,
    combine(
      previous,
      delta.add ? contribution(delta.add) : ZERO,
      delta.remove ? contribution(delta.remove) : ZERO,
    ),
  );
  return previous;
};

/** Откат onError: вернуть сводку к снимку из applySummaryDelta. */
export const restoreSummary = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
  previous: OperationSummary | undefined,
) => {
  if (previous) {
    queryClient.setQueryData(summaryQueryKey(reportId), previous);
  }
};
