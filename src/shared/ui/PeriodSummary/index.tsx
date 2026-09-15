import { Amount } from '@/shared/ui/Amount';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, percentOfIncome, type ConvertOptions } from '@/shared/utils';
import styles from './PeriodSummary.module.css';

interface PeriodSummaryProps {
  income: number;
  expenses: number;
  currencySymbol?: string | null;
  convertOptions?: ConvertOptions;
}

/** Сводка периода по всем счетам: переводы исключены сервером. */
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
        const percent = percentOfIncome(item.value, income);
        return (
          <VCard key={item.label} className={styles.card}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.value} data-tone={item.tone}>
              <Amount value={item.value} currencySymbol={currencySymbol} convert={convertOptions} />
            </div>
            <div className={styles.percent}>
              {percent === null
                ? 'Доля не определена: нет дохода'
                : `${formatAmount(percent)}% от дохода`}
            </div>
          </VCard>
        );
      })}
    </div>
  );
};
