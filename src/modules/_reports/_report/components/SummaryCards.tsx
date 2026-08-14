import type { OperationSummary } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useMemo } from 'react';

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
  const styles = useThemeStyles();

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
        color: styles.colors.success,
      },
      {
        label: 'Расходы',
        value: expenses,
        percent: percentOfIncome(expenses),
        color: styles.colors.error,
      },
      {
        label: 'Накопления',
        value: summary.savings,
        percent: percentOfIncome(summary.savings),
        color: styles.colors.warning,
      },
      {
        label: 'Остаток',
        value: balance,
        percent: summary.income > 0 ? Math.max(0, Math.round((balance / summary.income) * 100)) : 0,
        color: balance >= 0 ? styles.colors.success : styles.colors.error,
      },
    ];
  }, [summary, expenses, styles]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: styles.spacing.m,
      }}
    >
      {items.map((item) => (
        <VCard
          key={item.label}
          style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: styles.typography.fontSize.l,
              fontWeight: styles.typography.fontWeight.bold,
              color: item.color,
            }}
          >
            {formatAmount(item.value)}
          </div>
          {item.percent != null && (
            <div
              style={{
                fontSize: styles.typography.fontSize.s,
                color: styles.colors.textSecondary,
              }}
            >
              {item.percent}% от доходов
            </div>
          )}
        </VCard>
      ))}
    </div>
  );
};
