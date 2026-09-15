import { CurrencyText } from '@/shared/ui/Amount';
import { useBootstrap, useCurrency } from '@/shared/api/hooks';
import { ChevronRightIcon, ReportsIcon } from '@/shared/icons';
import summaryStyles from '@/shared/styles/summary.module.css';
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
    return <CardSkeleton delay="0.18s" />;
  }

  if (!lastReport) {
    return (
      <Link
        to="/reports"
        className={`${styles.link} ${styles.animateCard}`}
        style={{ animationDelay: '0.18s' }}
      >
        <VCard interactive className={styles.card}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>
              <ReportsIcon size={18} />
            </span>
            <div className={styles.title}>Последний период</div>
          </div>
          <div className={styles.emptyMessage}>Периоды не найдены</div>
          <div className={styles.subtitle}>Перейдите в раздел «Периоды» и добавьте период.</div>
          <VButton className={styles.fullWidthButton}>Добавить операцию</VButton>
        </VCard>
        <span className={styles.chevron}>
          <ChevronRightIcon size={18} />
        </span>
      </Link>
    );
  }

  const expenses = summary.expense;
  const balance = summary.income - expenses;
  const items = [
    {
      label: 'Доходы',
      value: formatAmount(summary.income, currency?.symbol),
      percent: null,
      color: 'var(--positive-ink)',
    },
    {
      label: 'Расходы',
      value: formatAmount(expenses, currency?.symbol),
      percent: percentOfIncome(expenses, summary.income),
      color: 'var(--md-sys-color-error)',
    },
    {
      label: 'Остаток',
      value: formatAmount(balance, currency?.symbol),
      percent: percentOfIncome(balance, summary.income),
      color: balance >= 0 ? 'var(--positive-ink)' : 'var(--md-sys-color-error)',
    },
  ];

  return (
    <Link
      to={`/reports/${lastReport.id}`}
      className={`${styles.link} ${styles.animateCard}`}
      style={{ animationDelay: '0.18s' }}
    >
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <ReportsIcon size={18} />
          </span>
          <div className={styles.title}>Последний период</div>
        </div>
        <div className={styles.subtitle}>{lastReport.name}</div>
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
              <CurrencyText>{item.value}</CurrencyText>
            </div>,
          ])}
        </div>
        <VButton className={styles.fullWidthButton}>Добавить операцию</VButton>
      </VCard>
      <span className={styles.chevron}>
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};
