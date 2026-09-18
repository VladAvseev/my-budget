import { Amount } from '@/shared/ui/Amount';
import { VCard } from '@/shared/ui/VCard';
import { type ConvertOptions } from '@/shared/utils';
import styles from './PeriodSummary.module.css';

interface PeriodSummaryProps {
  income: number;
  expenses: number;
  currencySymbol?: string | null;
  convertOptions?: ConvertOptions;
}

export const PeriodSummary = ({
  income,
  expenses,
  currencySymbol,
  convertOptions,
}: PeriodSummaryProps) => {
  const balance = income - expenses;
  const items = [
    { label: 'Расходы', value: expenses, tone: 'neutral' as const },
    { label: 'Доходы', value: income, tone: 'positive' as const },
    {
      label: 'Остаток',
      value: balance,
      tone: (balance >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
    },
  ];
  return (
    <div className={styles.grid}>
      {items.map((item) => {
        return (
          <VCard key={item.label} className={styles.card}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.value} data-tone={item.tone}>
              <Amount value={item.value} currencySymbol={currencySymbol} convert={convertOptions} />
            </div>
          </VCard>
        );
      })}
    </div>
  );
};
