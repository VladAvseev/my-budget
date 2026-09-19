import { CurrencyText } from '@/shared/ui/Amount';
import { useBootstrap, useCurrency } from '@/shared/api/hooks';
import { ChevronRightIcon, ReportsIcon } from '@/shared/icons';
import { currentMonthCode, formatMonthTitle } from '@/shared/utils';
import { formatAmount, percentOfIncome } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_SUMMARY = { income: 0, expense: 0 };

export const LastReportCard = () => {
  const { data, isLoading } = useBootstrap();
  const summary = data?.currentMonth ?? EMPTY_SUMMARY;
  const currency = useCurrency();
  const month = currentMonthCode();

  if (isLoading) {
    return <CardSkeleton delay="0.18s" wide />;
  }

  const expenses = summary.expense;
  const balance = summary.income - expenses;
  const balanceSavingsRate = balance > 0 ? percentOfIncome(balance, summary.income) : null;

  return (
    <Link to={`/reports/${month}`} className={`${styles.link} ${styles.heroLink}`}>
      <div className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={`${styles.titleChip} ${styles.titleChipOnPrimary}`}>
            <ReportsIcon size={20} />
          </span>
          <div className={styles.heroTitle}>{formatMonthTitle(month)}</div>
        </div>
        <div className={styles.heroBody}>
          <div className={styles.heroMain}>
            <div className={styles.heroKicker}>Остаток</div>
            <div className={styles.metricRow}>
              <div
                className={`${styles.heroValue}${balance < 0 ? ` ${styles.heroValueNegative}` : ''}`}
              >
                <CurrencyText>{formatAmount(balance, currency?.symbol)}</CurrencyText>
              </div>
              {balanceSavingsRate != null && (
                <span className={`${styles.savingsRateBadge} ${styles.savingsRateBadgeOnPrimary}`}>
                  {balanceSavingsRate}% норма сбережений
                </span>
              )}
            </div>
          </div>
          <div className={styles.heroFacts}>
            <div className={styles.heroFact}>
              <span className={styles.heroFactLabel}>Доходы</span>
              <span className={styles.heroFactValue}>
                <CurrencyText>{formatAmount(summary.income, currency?.symbol)}</CurrencyText>
              </span>
            </div>
            <div className={styles.heroFact}>
              <span className={styles.heroFactLabel}>Расходы</span>
              <span className={styles.heroFactValue}>
                <CurrencyText>{formatAmount(expenses, currency?.symbol)}</CurrencyText>
              </span>
            </div>
          </div>
        </div>
      </div>
      <span className={`${styles.chevron} ${styles.chevronOnPrimary}`} aria-hidden="true">
        <ChevronRightIcon size={20} />
      </span>
    </Link>
  );
};
