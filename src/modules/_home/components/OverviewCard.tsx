import { useCurrency, useProfile, useUserSummary } from '@/shared/hooks';
import { ChevronRightIcon, OverviewIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import summaryStyles from '@/shared/styles/summary.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { Link } from 'react-router-dom';
import styles from '../homeCard.module.css';

export const OverviewCard = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { data: summaryData, isFetched: summaryFetched } = useUserSummary(userId);
  const summary = summaryData ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const profileQuery = useProfile();
  const currency = useCurrency();

  if (!profileQuery.isFetched || !summaryFetched) {
    return (
      <VCard className={`${styles.loadingCard} ${styles.animateCard}`} style={{ animationDelay: '0.12s' }}>
        <VLoader size={28} />
      </VCard>
    );
  }

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const income = summary.income + startBalance;
  const balance = income - summary.expense - summary.daily - summary.savings;
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
      value: formatAmount(summary.expense + summary.daily, currency?.symbol),
      percent: percentOfIncome(summary.expense + summary.daily),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings, currency?.symbol),
      percent: percentOfIncome(summary.savings),
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
    <Link to="/overview" className={`${styles.link} ${styles.animateCard}`} style={{ animationDelay: '0.12s' }}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <OverviewIcon size={18} />
          </span>
          <div className={summaryStyles.title}>Аналитика</div>
        </div>
        <div className={summaryStyles.subtitle}>Последний период</div>
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