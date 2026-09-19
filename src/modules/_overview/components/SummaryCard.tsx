import { PeriodSummary } from '@/shared/widgets/PeriodSummary';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';

export const SummaryCard = ({ income, expenses }: { income: number; expenses: number }) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  return (
    <PeriodSummary
      income={income}
      expenses={expenses}
      currencySymbol={displaySymbol}
      convertOptions={convertOptions}
    />
  );
};
