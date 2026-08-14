import type { OperationSummary } from '@/shared/supabase/services/operations';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useMemo } from 'react';
import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
  summary: OperationSummary;
}

type SummaryItem = {
  label: string;
  value: number;
  percent: number | null;
  color: string;
};

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const expenses = summary.expense + summary.daily;

  const items = useMemo<SummaryItem[]>(() => {
    const balance = summary.income - expenses - summary.savings;
    const percentOfIncome = (value: number) =>
      summary.income > 0 ? Math.round((value / summary.income) * 100) : null;

    return [
      {
        label: 'Доходы',
        value: summary.income,
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
        value: summary.savings,
        percent: percentOfIncome(summary.savings),
        color: 'var(--color-warning)',
      },
      {
        label: 'Остаток',
        value: balance,
        percent: summary.income > 0 ? Math.max(0, Math.round((balance / summary.income) * 100)) : 0,
        color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
      },
    ];
  }, [summary, expenses]);

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