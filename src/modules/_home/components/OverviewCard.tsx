import { useAuth } from '@/shared/api/authProvider';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import {
  useBootstrap,
  useCapital,
  useCurrency,
  type UseBootstrapResponse,
} from '@/shared/api/hooks';
import { ChevronRightIcon, OverviewIcon } from '@/shared/icons';
import summaryStyles from '@/shared/styles/summary.module.css';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, percentOfIncome } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { startBalance: 0, currency: null, onboarded: false },
  onboarding: { categories: 0, reports: 0, operations: 0 },
  lastReport: null,
  globalTotals: { income: 0, expense: 0, daily: 0 },
};

export const OverviewCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();
  const { user } = useAuth();
  const capitalQuery = useCapital(user?.id ?? '');

  if (isLoading || capitalQuery.isLoading) {
    return <CardSkeleton delay="0.12s" />;
  }

  const bootstrap = data ?? EMPTY_BOOTSTRAP;
  if (capitalQuery.isError) {
    return (
      <VErrorCard
        title="Не удалось загрузить капитал"
        error={capitalQuery.error}
        onRetry={() => void capitalQuery.refetch()}
        isRetrying={capitalQuery.isFetching}
      />
    );
  }
  const { income, expense: regularExpense, daily } = bootstrap.globalTotals;
  const expense = regularExpense + daily;
  const capital = capitalQuery.capital ?? 0;

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
      percent: percentOfIncome(expense, income),
      color: 'var(--color-error)',
    },
    {
      label: 'Капитал',
      value: formatAmount(capital, currency?.symbol),
      percent: null,
      color: capital >= 0 ? 'var(--color-success)' : 'var(--color-error)',
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
          Доходы и расходы за всё время · капитал по всем счетам
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
