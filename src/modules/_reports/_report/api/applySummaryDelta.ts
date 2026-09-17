import type { OperationSummary } from '@/shared/api/hooks';
import type { OperationType } from '@/shared/api/types/domain';
import type { useQueryClient } from '@tanstack/react-query';
import { summaryQueryKey } from './keys';



export interface SummaryOperationRef {
  type: OperationType | string;
  amount: number;
}

const ZERO: OperationSummary = { income: 0, expense: 0 };

const contribution = ({ type, amount }: SummaryOperationRef): OperationSummary => {
  const delta = { ...ZERO };
  switch (type) {
    case 'income':
      delta.income = amount;
      break;
    case 'expense':
      delta.expense = amount;
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
});


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


export const restoreSummary = (
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
  previous: OperationSummary | undefined,
) => {
  if (previous) {
    queryClient.setQueryData(summaryQueryKey(reportId), previous);
  }
};
