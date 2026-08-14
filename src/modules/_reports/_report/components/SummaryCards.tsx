import type { OperationSummary } from '@/shared/supabase/services/operations';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useMemo } from 'react';
import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
  summary: OperationSummary | undefined;
}

type SummaryItem = {
  label: string;
  value: number;
  percent: number | null;
  color: string;
};

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const summaryData = useMemo(
    () => summary ?? { income: 0, expense: 0, savings: 0, daily: 0 },
    [summary],
  );
  const expenses = summaryData.expense + summaryData.daily;

  const items = useMemo<SummaryItem[]>(() => {
    const balance = summaryData.income - expenses - summaryData.savings;
    const percentOfIncome = (value: number) =>
      summaryData.income > 0 ? Math.round((value / summaryData.income) * 100) : null;

    return [
      {
        label: 'Доходы',
        value: summaryData.income,
        percent: null,
        color: 'var(--color-success)',
      },
      {
        label: 'Расходы',
        value: expenses,
        percent: percentOfIncome(expenses),
        color: 'var(--color-error)',
      },
      {
        label: 'Накопления',
        value: summaryData.savings,
        percent: percentOfIncome(summaryData.savings),
        color: 'var(--color-warning)',
      },
      {
        label: 'Остаток',
        value: balance,
        percent: summaryData.income > 0 ? Math.max(0, Math.round((balance / summaryData.income) * 100)) : 0,
        color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
      },
    ];
  }, [summaryData, expenses]);

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <VCard key={item.label} className={styles.card}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value} style={{ color: item.color }}>
            {formatAmount(item.value)}
          </div>
          {item.percent != null && (
            <div className={styles.percent}>{item.percent}% от доходов</div>
          )}
        </VCard>
      ))}
    </div>
  );
};