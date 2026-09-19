import { CurrencyText } from '@/shared/ui/Amount';
import { useBootstrap, useCurrency } from '@/shared/api/hooks';
import { ChevronRightIcon, OverviewIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, percentOfIncome } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_SUMMARY = { income: 0, expense: 0 };

export const OverviewCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();

  if (isLoading) {
    return <CardSkeleton delay="0.12s" wide />;
  }

  const summary = data?.trailingYear ?? EMPTY_SUMMARY;
  const { income, expense } = summary;
  const balance = income - expense;
  const balanceSavingsRate = balance > 0 ? percentOfIncome(balance, income) : null;

  return (
    <Link to="/overview" className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleChip}>
            <OverviewIcon size={20} />
          </span>
          <div className={styles.title}>Аналитика</div>
        </div>
        <div className={styles.capitalBlock}>
          <div className={styles.capitalKicker}>Остаток за последний год</div>
          <div className={styles.metricRow}>
            <div
              className={`${styles.capitalValue}${balance < 0 ? ` ${styles.capitalValueNegative}` : ''}`}
            >
              <CurrencyText>{formatAmount(balance, currency?.symbol)}</CurrencyText>
            </div>
            {balanceSavingsRate != null && (
              <span className={`${styles.savingsRateBadge} ${styles.savingsRateBadgeSurface}`}>
                {balanceSavingsRate}% норма сбережений
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
