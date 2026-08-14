import { useReports } from '../api/useReports';
import { useSummary } from '../api/useSummary';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { Link } from 'react-router-dom';

export const LastReportCard = () => {
  const styles = useThemeStyles();
  const reportsQuery = useReports();
  const reports = reportsQuery.data ?? [];
  const lastReport = reports[0];
  const { data: summary, isFetched: summaryFetched } = useSummary(lastReport?.id ?? '');

  if (reportsQuery.isLoading) {
    return (
      <VCard
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: styles.spacing.xl,
          flex: '1 1 300px',
          minWidth: 300,
        }}
      >
        <VLoader size={28} />
      </VCard>
    );
  }

  if (reportsQuery.error || !lastReport) {
    return (
      <Link
        to="/reports"
        style={{ textDecoration: 'none', display: 'block', flex: '1 1 300px', minWidth: 300 }}
      >
        <VCard
          interactive
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: styles.spacing.m,
            height: '100%',
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.l,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
            }}
          >
            Последний отчёт
          </div>
          <div
            style={{
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.medium,
              color: styles.colors.textPrimary,
            }}
          >
            Отчёты не найдены
          </div>
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
            }}
          >
            Перейдите в раздел «Отчёты» и создайте отчёт.
          </div>
        </VCard>
      </Link>
    );
  }

  if (!summaryFetched) {
    return (
      <VCard
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: styles.spacing.xl,
          flex: '1 1 300px',
          minWidth: 300,
        }}
      >
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
      color: styles.colors.success,
    },
    {
      label: 'Расходы',
      value: formatAmount(expenses),
      percent: percentOfIncome(expenses),
      color: styles.colors.error,
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings),
      percent: percentOfIncome(summary.savings),
      color: styles.colors.warning,
    },
    {
      label: 'Остаток',
      value: formatAmount(balance),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? styles.colors.success : styles.colors.error,
    },
  ];

  return (
    <Link
      to={`/reports/${lastReport.id}`}
      style={{ textDecoration: 'none', display: 'block', flex: '1 1 300px', minWidth: 300 }}
    >
      <VCard
        interactive
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: styles.spacing.m,
          height: '100%',
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Последний отчёт
        </div>
        <div
          style={{
            fontSize: styles.typography.fontSize.s,
            color: styles.colors.textSecondary,
          }}
        >
          {lastReport.name}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto auto',
            columnGap: styles.spacing.m,
            rowGap: styles.spacing.s,
          }}
        >
          {items.flatMap((item) => [
            <div
              key={`${item.label}-label`}
              style={{
                fontSize: styles.typography.fontSize.s,
                color: styles.colors.textSecondary,
              }}
            >
              {item.label}
            </div>,
            item.percent != null ? (
              <div
                key={`${item.label}-percent`}
                style={{
                  fontSize: styles.typography.fontSize.s,
                  color: styles.colors.textSecondary,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.percent}% от доходов
              </div>
            ) : (
              <span key={`${item.label}-percent`} />
            ),
            <div
              key={`${item.label}-value`}
              style={{
                fontSize: styles.typography.fontSize.m,
                fontWeight: styles.typography.fontWeight.bold,
                color: item.color,
                textAlign: 'right',
              }}
            >
              {item.value}
            </div>,
          ])}
        </div>
      </VCard>
    </Link>
  );
};
