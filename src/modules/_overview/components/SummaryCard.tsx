import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import summaryStyles from '@/shared/styles/summary.module.css';
import { percentOfIncome } from '../utils/overview';

interface SummaryCardProps {
  income: number;
  expenses: number;
  savings: number;
}

export const SummaryCard = ({ income, expenses, savings }: SummaryCardProps) => {
  const balance = income - expenses - savings;

  const items = [
    {
      label: 'Доходы',
      value: income,
      percent: percentOfIncome(income, income),
      color: 'var(--color-success)',
    },
    {
      label: 'Расходы',
      value: expenses,
      percent: percentOfIncome(expenses, income),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: savings,
      percent: percentOfIncome(savings, income),
      color: 'var(--color-warning)',
    },
    {
      label: 'Остаток',
      value: balance,
      percent: balance >= 0 ? percentOfIncome(balance, income) : 0,
      color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
    },
  ];

  return (
    <VCard className={summaryStyles.card}>
      <div className={summaryStyles.grid}>
        {items.flatMap((item) => [
          <div key={`${item.label}-label`} className={summaryStyles.label}>
            {item.label}
          </div>,
          <div
            key={`${item.label}-value`}
            className={summaryStyles.value}
            style={{ color: item.color }}
          >
            {formatAmount(item.value)}
          </div>,
          item.percent != null ? (
            <div key={`${item.label}-percent`} className={summaryStyles.percent}>
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