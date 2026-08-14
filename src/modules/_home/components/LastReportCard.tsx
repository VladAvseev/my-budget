import { useReports } from '../api/useReports';
import { useSummary } from '../api/useSummary';
import summaryStyles from '@/shared/styles/summary.module.css';
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

  if (reportsQuery.isLoading) {
    return (
      <VCard className={styles.loadingCard}>
        <VLoader size={28} />
      </VCard>
    );
  }

  if (reportsQuery.error || !lastReport) {
    return (
      <Link to="/reports" className={styles.link}>
        <VCard interactive className={styles.card}>
          <div className={styles.title}>Последний отчёт</div>
          <div className={styles.emptyMessage}>Отчёты не найдены</div>
          <div className={styles.subtitle}>
            Перейдите в раздел «Отчёты» и создайте отчёт.
          </div>
        </VCard>
      </Link>
    );
  }

  if (!summaryFetched) {
    return (
      <VCard className={styles.loadingCard}>
        <VLoader size={28} />
      </VCard>
    );
  }

  const expenses = summary.expense + summary.daily;
  const balance = summary.income - expenses - summary.savings;
  const percentOfIncome = (value: number) =>
    summary.income > 0 ? Math.round((value / summary.income) * 100) : null;

  const items = [
    {
      label: 'Доходы',
      value: formatAmount(summary.income),
      percent: null,
      color: 'var(--color-success)',
    },
    {
      label: 'Расходы',
      value: formatAmount(expenses),
      percent: percentOfIncome(expenses),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings),
      percent: percentOfIncome(summary.savings),
      color: 'var(--color-warning)',
    },
    {
      label: 'Остаток',
      value: formatAmount(balance),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
    },
  ];

  return (
    <Link to={`/reports/${lastReport.id}`} className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={styles.title}>Последний отчёт</div>
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
      </VCard>
    </Link>
  );
};