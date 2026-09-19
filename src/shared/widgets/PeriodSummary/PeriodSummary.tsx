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

  let savingsBadge: { shortText: string; fullText: string; tone: 'positive' | 'negative' } | null =
    null;
  if (balancePercent !== null && income > 0) {
    if (balance >= 0) {
      savingsBadge = {
        shortText: `${formatAmount(balancePercent)}% сбережения`,
        fullText: `${formatAmount(balancePercent)}% норма сбережений`,
        tone: 'positive',
      };
    } else {
      savingsBadge = {
        shortText: `${formatAmount(Math.abs(balancePercent))}% дефицит`,
        fullText: `${formatAmount(Math.abs(balancePercent))}% дефицит`,
        tone: 'negative',
      };
    }
  }

  const items = [
    {
      label: 'Доходы',
      value: income,
      tone: 'positive' as const,
      badge: null,
    },
    {
      label: 'Расходы',
      value: expenses,
      tone: 'negative' as const,
      badge: null,
    },
    {
      label: 'Остаток',
      value: balance,
      tone: balance >= 0 ? ('positive' as const) : ('negative' as const),
      badge: savingsBadge,
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
          {item.badge && (
            <span className={styles.savingsBadge} data-tone={item.badge.tone}>
              <span className={styles.savingsBadgeShort}>{item.badge.shortText}</span>
              <span className={styles.savingsBadgeFull}>{item.badge.fullText}</span>
            </span>
          )}
        </VCard>
      ))}
    </div>
  );
};
