import {
  useBootstrap,
  useCurrency,
  type UseBootstrapResponse,
} from '@/shared/api/hooks';
import { ChevronRightIcon, OverviewIcon } from '@/shared/icons';
import summaryStyles from '@/shared/styles/summary.module.css';
import { VCard } from '@/shared/ui/VCard';
import { computeGlobalTotals, formatAmount } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { startBalance: 0, currency: null, onboarded: false },
  onboarding: { categories: 0, reports: 0, operations: 0 },
  lastReport: null,
  globalTotals: { income: 0, expense: 0, savings: 0, daily: 0, accumulationsTotal: 0 },
  savingsStructure: [],
  goals: [],
};

export const OverviewCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();

  if (isLoading) {
    return <CardSkeleton delay="0.12s" />;
  }

  const bootstrap = data ?? EMPTY_BOOTSTRAP;
  const startBalance = Number(bootstrap.profile.startBalance) || 0;
  const { income, expense, savings: savingsTotal, balance } = computeGlobalTotals(
    startBalance,
    bootstrap.globalTotals,
    bootstrap.globalTotals.accumulationsTotal,
  );
  const percentOfIncome = (value: number) =>
    income > 0 ? Math.max(0, Math.round((value / income) * 100)) : null;

  const items = [
    {
      label: 'Доходы',
      value: formatAmount(income, currency?.symbol),
      percent: null,
      color: 'var(--color-success)',
    },
    {
      label: 'Расходы',
      value: formatAmount(expense, currency?.symbol),
      percent: percentOfIncome(expense),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: formatAmount(savingsTotal, currency?.symbol),
      percent: percentOfIncome(savingsTotal),
      color: 'var(--color-warning)',
    },
    {
      label: 'Баланс',
      value: formatAmount(balance, currency?.symbol),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
    },
  ];

  return (
    <Link
      to="/overview"
      className={`${styles.link} ${styles.animateCard}`}
      style={{ animationDelay: '0.12s' }}
    >
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <OverviewIcon size={18} />
          </span>
          <div className={summaryStyles.title}>Аналитика</div>
        </div>
        <div className={summaryStyles.subtitle}>
          Общая сводка с учётом начального баланса и накоплений
        </div>
        <div className={summaryStyles.grid}>
          {items.flatMap((item) => [
            <div key={`${item.label}-label`} className={summaryStyles.label}>
              {item.label}
            </div>,
            item.percent != null ? (
              <div key={`${item.label}-percent`} className={summaryStyles.percent}>
                {item.percent}% от доходов
              </div>
            ) : (
              <span key={`${item.label}-percent`} />
            ),
            <div
              key={`${item.label}-value`}
              className={summaryStyles.value}
              style={{ color: item.color }}
            >
              {item.value}
            </div>,
          ])}
        </div>
      </VCard>
      <span className={styles.chevron}>
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};
