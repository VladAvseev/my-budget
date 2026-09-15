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
    { label: 'Расходы', value: expenses, color: 'var(--md-sys-color-on-surface)' },
    { label: 'Доходы', value: income, color: 'var(--positive-ink)' },
    {
      label: 'Остаток',
      value: balance,
      color: balance >= 0 ? 'var(--positive-ink)' : 'var(--md-sys-color-error)',
    },
  ];
  return (
    <div className={styles.grid}>
      {items.map((item) => {
        const percent = percentOfIncome(item.value, income);
        return (
          <VCard key={item.label} className={styles.card}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.value} style={{ color: item.color }}>
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
