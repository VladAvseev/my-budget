import { CurrencyText } from '@/shared/ui/Amount';
import { useAuth } from '@/shared/api/authProvider';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import {
  useBootstrap,
  useCapital,
  useCurrency,
  type UseBootstrapResponse,
} from '@/shared/api/hooks';
import { ChevronRightIcon, OverviewIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, percentOfIncome } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { currency: null, onboarded: false },
  onboarding: { categories: 0, reports: 0, operations: 0 },
  lastReport: null,
  globalTotals: { income: 0, expense: 0 },
};

export const OverviewCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();
  const { user } = useAuth();
  const capitalQuery = useCapital(user?.id ?? '');

  if (isLoading || capitalQuery.isLoading) {
    return <CardSkeleton delay="0.12s" wide />;
  }

  const bootstrap = data ?? EMPTY_BOOTSTRAP;
  if (capitalQuery.isError) {
    return (
      <VErrorCard
        className={styles.errorCard}
        title="Не удалось загрузить капитал"
        error={capitalQuery.error}
        onRetry={() => void capitalQuery.refetch()}
        isRetrying={capitalQuery.isFetching}
      />
    );
  }
  const { income, expense } = bootstrap.globalTotals;
  const capital = capitalQuery.capital ?? 0;

  const items = [
    {
      label: 'Доходы',
      value: formatAmount(income, currency?.symbol),
      percent: null,
      color: 'var(--positive-ink)',
    },
    {
      label: 'Расходы',
      value: formatAmount(expense, currency?.symbol),
      percent: percentOfIncome(expense, income),
      color: 'var(--md-sys-color-error)',
    },
  ];

  return (
    <Link to="/overview" className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleChip}>
            <OverviewIcon size={18} />
          </span>
          <div className={styles.title}>Аналитика</div>
        </div>
        <div className={styles.subtitle}>
          Доходы и расходы за всё время · капитал по всем счетам
        </div>
        <div className={styles.capitalBlock}>
          <div className={styles.capitalKicker}>Капитал</div>
          <div
            className={`${styles.capitalValue}${capital < 0 ? ` ${styles.capitalValueNegative}` : ''}`}
          >
            <CurrencyText>{formatAmount(capital, currency?.symbol)}</CurrencyText>
          </div>
        </div>
        <div className={styles.summaryGrid}>
          {items.flatMap((item) => [
            <div key={`${item.label}-label`} className={styles.summaryLabel}>
              {item.label}
            </div>,
            item.percent != null ? (
              <div key={`${item.label}-percent`} className={styles.summaryPercent}>
                {item.percent}% от доходов
              </div>
            ) : (
              <span key={`${item.label}-percent`} />
            ),
            <div
              key={`${item.label}-value`}
              className={styles.summaryValue}
              style={{ color: item.color }}
            >
              <CurrencyText>{item.value}</CurrencyText>
            </div>,
          ])}
        </div>
      </VCard>
      <span className={styles.chevron} aria-hidden="true">
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};
