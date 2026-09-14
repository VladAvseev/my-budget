import { useCurrency, type OperationSummary } from '@/shared/api/hooks';
import { PeriodSummary } from '@/shared/ui/PeriodSummary';

export const SummaryCards = ({ summary }: { summary: OperationSummary | undefined }) => {
  const currency = useCurrency();
  return (
    <PeriodSummary
      income={summary?.income ?? 0}
      expenses={(summary?.expense ?? 0) + (summary?.daily ?? 0)}
      currencySymbol={currency?.symbol}
    />
  );
};
