import { CurrencyText } from '@/shared/ui/Amount';
import { useBootstrap, useCurrency } from '@/shared/api/hooks';
import { ReportsIcon } from '@/shared/icons';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, percentOfIncome } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_SUMMARY = { income: 0, expense: 0 };

export const LastReportCard = () => {
  const { data, isLoading } = useBootstrap();
  const lastReport = data?.lastReport ?? null;
  const summary = lastReport?.summary ?? EMPTY_SUMMARY;
  const currency = useCurrency();

  if (isLoading) {
    return <CardSkeleton delay="0.18s" wide />;
  }

  if (!lastReport) {
    return (
      <Link to="/reports" className={`${styles.link} ${styles.heroLink}`}>
        <VCard interactive className={styles.card}>
          <div className={styles.titleRow}>
            <span className={styles.titleChip}>
              <ReportsIcon size={18} />
            </span>
            <div className={styles.title}>Последний период</div>
          </div>
          <div className={styles.emptyMessage}>Периоды не найдены</div>
          <div className={styles.subtitle}>Перейдите в раздел «Периоды» и добавьте период.</div>
          <VButton className={styles.fullWidthButton}>Добавить операцию</VButton>
        </VCard>
      </Link>
    );
  }

  const expenses = summary.expense;
  const balance = summary.income - expenses;
  const expensePercent = percentOfIncome(expenses, summary.income);

  return (
    <Link to={`/reports/${lastReport.id}`} className={`${styles.link} ${styles.heroLink}`}>
      <div className={`${styles.hero} ${styles.animateCard}`}>
        <div className={styles.titleRow}>
          <span className={`${styles.titleChip} ${styles.titleChipOnPrimary}`}>
            <ReportsIcon size={18} />
          </span>
          <div className={styles.heroTitle}>Последний период</div>
        </div>
        <div className={styles.heroSubtitle}>{lastReport.name}</div>
        <div className={styles.heroBody}>
          <div className={styles.heroMain}>
            <div className={styles.heroKicker}>Остаток</div>
            <div
              className={`${styles.heroValue}${balance < 0 ? ` ${styles.heroValueNegative}` : ''}`}
            >
              <CurrencyText>{formatAmount(balance, currency?.symbol)}</CurrencyText>
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
                {expensePercent != null && (
                  <span className={styles.heroFactSub}> · {expensePercent}% от доходов</span>
                )}
              </span>
            </div>
          </div>
        </div>
        <VButton className={styles.fullWidthButton}>Добавить операцию</VButton>
      </div>
    </Link>
  );
};
