import styles from './SummaryCard.module.css';
import { PeriodSummary } from '@/shared/ui/PeriodSummary';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';

export const SummaryCard = ({ income, expenses }: { income: number; expenses: number }) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  return (
    <section className={styles.summary} aria-label="Расходы, доходы, остаток">
      <PeriodSummary
        income={income}
        expenses={expenses}
        currencySymbol={displaySymbol}
        convertOptions={convertOptions}
      />
    </section>
  );
};
