import { useReports } from '../api/useReports';
import { useSummary } from '../api/useSummary';
import { ChevronRightIcon, ReportsIcon } from '@/shared/icons';
import { useCurrency } from '@/shared/hooks';
import summaryStyles from '@/shared/styles/summary.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { Link } from 'react-router-dom';
import styles from '../homeCard.module.css';

export const LastReportCard = () => {
  const reportsQuery = useReports();
  const reports = reportsQuery.data ?? [];
  const lastReport = reports[0];
  const { data: summaryData, isFetched: summaryFetched } = useSummary(lastReport?.id ?? '');
  const summary = summaryData ?? { income: 0, expense: 0, savings: 0, daily: 0 };
  const currency = useCurrency();

  if (reportsQuery.isLoading) {
    return (
      <VCard className={`${styles.loadingCard} ${styles.animateCard}`} style={{ animationDelay: '0.18s' }}>
        <VLoader size={28} />
      </VCard>
    );
  }

  if (reportsQuery.error || !lastReport) {
    return (
      <Link to="/reports" className={`${styles.link} ${styles.animateCard}`} style={{ animationDelay: '0.18s' }}>
        <VCard interactive className={styles.card}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>
              <ReportsIcon size={18} />
            </span>
            <div className={styles.title}>Последний период</div>
          </div>
          <div className={styles.emptyMessage}>Периоды не найдены</div>
          <div className={styles.subtitle}>
            Перейдите в раздел «Периоды» и добавьте период.
          </div>
          <VButton className={styles.fullWidthButton}>Добавить операцию</VButton>
        </VCard>
        <span className={styles.chevron}>
          <ChevronRightIcon size={18} />
        </span>
      </Link>
    );
  }

  if (!summaryFetched) {
    return (
      <VCard className={`${styles.loadingCard} ${styles.animateCard}`} style={{ animationDelay: '0.18s' }}>
        <VLoader size={28} />
      </VCard>
    );
  }

  const expenses = summary.expense + summary.daily;
  const balance = summary.income - expenses - summary.savings;
  const percentOfIncome = (value: number) =>
    summary.income > 0 ? Math.max(0, Math.round((value / summary.income) * 100)) : null;

  const items = [
    {
      label: 'Доходы',
      value: formatAmount(summary.income, currency?.symbol),
      percent: null,
      color: 'var(--color-success)',
    },
    {
      label: 'Расходы',
      value: formatAmount(expenses, currency?.symbol),
      percent: percentOfIncome(expenses),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings, currency?.symbol),
      percent: percentOfIncome(summary.savings),
      color: 'var(--color-warning)',
    },
    {
      label: 'Остаток',
      value: formatAmount(balance, currency?.symbol),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
    },
  ];

  return (
    <Link to={`/reports/${lastReport.id}`} className={`${styles.link} ${styles.animateCard}`} style={{ animationDelay: '0.18s' }}>
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
              {item.value}
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