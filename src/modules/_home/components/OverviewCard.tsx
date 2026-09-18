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
  const expensePercent = percentOfIncome(expense, income);
  const capitalSavingsRate = capital > 0 ? percentOfIncome(capital, income) : null;

  return (
    <Link to="/overview" className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleChip}>
            <OverviewIcon size={20} />
          </span>
          <div className={styles.title}>Аналитика</div>
        </div>
        <div className={styles.subtitle}>
          Доходы и расходы за всё время по всем счетам
        </div>
        <div className={styles.capitalBlock}>
          <div className={styles.capitalKicker}>Капитал</div>
          <div className={styles.metricRow}>
            <div
              className={`${styles.capitalValue}${capital < 0 ? ` ${styles.capitalValueNegative}` : ''}`}
            >
              <CurrencyText>{formatAmount(capital, currency?.symbol)}</CurrencyText>
            </div>
            {capitalSavingsRate != null && (
              <span className={`${styles.savingsRateBadge} ${styles.savingsRateBadgeSurface}`}>
                {capitalSavingsRate}% норма сбережений
              </span>
            )}
          </div>
        </div>
        <div className={styles.cardFacts}>
          <div className={styles.cardFact}>
            <span className={styles.cardFactLabel}>Доходы</span>
            <span className={`${styles.cardFactValue} ${styles.incomeValue}`}>
              <CurrencyText>{formatAmount(income, currency?.symbol)}</CurrencyText>
            </span>
          </div>
          <div className={styles.cardFact}>
            <span className={styles.cardFactLabel}>Расходы</span>
            <span className={`${styles.cardFactValue} ${styles.expenseValue}`}>
              <CurrencyText>{formatAmount(expense, currency?.symbol)}</CurrencyText>
              {expensePercent != null && (
                <span className={styles.cardFactSub}> · {expensePercent}% от доходов</span>
              )}
            </span>
          </div>
        </div>
      </VCard>
      <span className={styles.chevron} aria-hidden="true">
        <ChevronRightIcon size={20} />
      </span>
    </Link>
  );
};
