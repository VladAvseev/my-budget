import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useCurrency } from '@/shared/hooks';
import { percentOfIncome } from '../utils/overview';
import styles from './SummaryCard.module.css';

interface SummaryCardProps {
  income: number;
  expenses: number;
  savings: number;
}

export const SummaryCard = ({ income, expenses, savings }: SummaryCardProps) => {
  const currency = useCurrency();
  const balance = income - expenses - savings;

  const items = [
    {
      label: 'Доходы',
      value: income,
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
    <div className={styles.grid}>
      {items.map((item) => (
        <VCard key={item.label} className={styles.card}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value} style={{ color: item.color }}>
            {formatAmount(item.value, currency?.symbol)}
          </div>
          {item.percent != null && <div className={styles.percent}>{item.percent}% от доходов</div>}
        </VCard>
      ))}
    </div>
  );
};
