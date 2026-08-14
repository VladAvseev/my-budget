import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { percentOfIncome } from '../utils/overview';

interface SummaryCardProps {
  income: number;
  expenses: number;
  savings: number;
}

export const SummaryCard = ({ income, expenses, savings }: SummaryCardProps) => {
  const styles = useThemeStyles();

  const balance = income - expenses - savings;

  const items = [
    {
      label: 'Доходы',
      value: income,
      percent: percentOfIncome(income, income),
      color: styles.colors.success,
    },
    {
      label: 'Расходы',
      value: expenses,
      percent: percentOfIncome(expenses, income),
      color: styles.colors.error,
    },
    {
      label: 'Накопления',
      value: savings,
      percent: percentOfIncome(savings, income),
      color: styles.colors.warning,
    },
    {
      label: 'Остаток',
      value: balance,
      percent: balance >= 0 ? percentOfIncome(balance, income) : 0,
      color: balance >= 0 ? styles.colors.success : styles.colors.error,
    },
  ];

  return (
    <VCard style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
      <div
        style={{
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          color: styles.colors.textPrimary,
        }}
      >
        Сводка
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto auto',
          columnGap: styles.spacing.m,
          rowGap: styles.spacing.s,
        }}
      >
        {items.flatMap((item) => [
          <div
            key={`${item.label}-label`}
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
            }}
          >
            {item.label}
          </div>,
          <div
            key={`${item.label}-value`}
            style={{
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.bold,
              color: item.color,
              textAlign: 'right',
            }}
          >
            {formatAmount(item.value)}
          </div>,
          item.percent != null ? (
            <div
              key={`${item.label}-percent`}
              style={{
                fontSize: styles.typography.fontSize.s,
                color: styles.colors.textSecondary,
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}
            >
              {item.percent}% от доходов
            </div>
          ) : (
            <span key={`${item.label}-percent`} />
          ),
        ])}
      </div>
    </VCard>
  );
};