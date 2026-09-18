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

export const PeriodSummary = ({
  income,
  expenses,
  currencySymbol,
  convertOptions,
}: PeriodSummaryProps) => {
  const balance = income - expenses;
  const balancePercent = percentOfIncome(balance, income);

  const items: {
    label: string;
    value: number;
    tone: 'positive' | 'negative' | 'neutral';
    percentText: string | null;
  }[] = [
    {
      label: 'Доходы',
      value: income,
      tone: 'positive',
      percentText: null,
    },
    {
      label: 'Расходы',
      value: expenses,
      tone: 'negative',
      percentText: null,
    },
    {
      label: 'Остаток',
      value: balance,
      tone: balance >= 0 ? 'positive' : 'negative',
      percentText:
        balancePercent !== null && income > 0 ? `сбережения: ${formatAmount(balancePercent)}%` : null,
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <VCard key={item.label} className={styles.card}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value} data-tone={item.tone}>
            <Amount value={item.value} currencySymbol={currencySymbol} convert={convertOptions} />
          </div>
          {item.percentText && <div className={styles.percent}>{item.percentText}</div>}
        </VCard>
      ))}
    </div>
  );
};
