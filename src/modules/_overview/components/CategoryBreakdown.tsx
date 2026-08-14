import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import type { Report } from '@/shared/supabase/services/reports';
import { useThemeStyles } from '@/shared/theme';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { buildCategoryGroups, buildReportGroups, type ReportAmount } from '../utils/overview';

interface CategoryBreakdownProps {
  reports: Report[];
  operationsByReport: Map<string, Operation[]>;
}

const ReportLinkRow = ({ report, amount }: ReportAmount) => {
  const styles = useThemeStyles();

  return (
    <Link to={`/reports/${report.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <VCard
        interactive
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.m,
        }}
      >
        <span
          style={{
            fontSize: styles.typography.fontSize.m,
            color: styles.colors.textPrimary,
          }}
        >
          {report.name}
        </span>
        <span
          style={{
            fontSize: styles.typography.fontSize.m,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          {formatAmount(amount)}
        </span>
      </VCard>
    </Link>
  );
};

const hasOperations = (operationsByReport: Map<string, Operation[]>, typeFilter: OperationType[]) =>
  [...operationsByReport.values()].some((operations) =>
    operations.some((operation) => typeFilter.includes(operation.type as OperationType)),
  );

const AccordionSummary = ({ total, reportCount }: { total: number; reportCount: number }) => {
  const styles = useThemeStyles();
  const average = reportCount > 0 ? total / reportCount : 0;

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: styles.spacing.xs,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: styles.typography.fontSize.m, color: styles.colors.textSecondary }}>
        Всего:{' '}
        <span style={{ fontWeight: styles.typography.fontWeight.bold }}>{formatAmount(total)}</span>
      </span>
      <span style={{ fontSize: styles.typography.fontSize.m, color: styles.colors.textSecondary }}>
        В среднем:{' '}
        <span style={{ fontWeight: styles.typography.fontWeight.bold }}>
          {formatAmount(average)}
        </span>
      </span>
    </span>
  );
};

export const CategoryBreakdown = ({ reports, operationsByReport }: CategoryBreakdownProps) => {
  const styles = useThemeStyles();
  const { expenseCategories, incomeCategories, savingsCategories } = useOverviewCategories();

  const expensesLoading = expenseCategories.isLoading;
  const incomesLoading = incomeCategories.isLoading;
  const savingsLoading = savingsCategories.isLoading;

  const dailyGroups = buildReportGroups(reports, operationsByReport, ['daily']);
  const expenseGroups = buildCategoryGroups(
    reports,
    operationsByReport,
    expenseCategories.data ?? [],
    ['expense'],
  );
  const incomeGroups = buildCategoryGroups(
    reports,
    operationsByReport,
    incomeCategories.data ?? [],
    ['income'],
  );
  const savingsGroups = buildCategoryGroups(
    reports,
    operationsByReport,
    savingsCategories.data ?? [],
    ['savings', 'savings_out'],
  );

  const sectionTitle = (label: string, average: number) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
      }}
    >
      <div
        style={{
          fontSize: styles.typography.fontSize.xl,
          fontWeight: styles.typography.fontWeight.bold,
          color: styles.colors.textPrimary,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: styles.typography.fontSize.m,
          color: styles.colors.textSecondary,
          whiteSpace: 'nowrap',
        }}
      >
        В среднем:{' '}
        <span style={{ fontWeight: styles.typography.fontWeight.bold }}>
          {formatAmount(average)}
        </span>
      </div>
    </div>
  );

  const categoryAccordions = (
    groups: ReturnType<typeof buildCategoryGroups>,
    loading: boolean,
    typeFilter: OperationType[],
  ) => {
    if (loading && hasOperations(operationsByReport, typeFilter)) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.l }}>
          <VLoader size={24} />
        </div>
      );
    }
    if (groups.length === 0) {
      return null;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
        {groups.map((group) => (
          <VAccordion
            key={group.key}
            header={
              <span style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    borderRadius: styles.radius.round,
                    backgroundColor: group.color ?? styles.colors.border,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>{group.label}</span>
                <AccordionSummary total={group.total} reportCount={reports.length} />
              </span>
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: styles.spacing.s,
              }}
            >
              {group.byReport.map((item) => (
                <ReportLinkRow key={item.report.id} report={item.report} amount={item.amount} />
              ))}
            </div>
          </VAccordion>
        ))}
      </div>
    );
  };

  const totalDaily = dailyGroups.reduce((sum, item) => sum + item.amount, 0);
  const totalOf = (groups: ReturnType<typeof buildCategoryGroups>) =>
    groups.reduce((sum, group) => sum + group.total, 0);
  const sectionAverage = (total: number) => (reports.length > 0 ? total / reports.length : 0);
  const hasExpenseOrDaily =
    expenseGroups.length > 0 ||
    dailyGroups.length > 0 ||
    hasOperations(operationsByReport, ['expense']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xl }}>
      {hasExpenseOrDaily && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {sectionTitle('Расходы', sectionAverage(totalDaily + totalOf(expenseGroups)))}
          {dailyGroups.length > 0 && (
            <VAccordion
              header={
                <span style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m }}>
                  <span style={{ flex: 1, minWidth: 0 }}>Ежедневные расходы</span>
                  <AccordionSummary total={totalDaily} reportCount={reports.length} />
                </span>
              }
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: styles.spacing.s,
                }}
              >
                {dailyGroups.map((item) => (
                  <ReportLinkRow key={item.report.id} report={item.report} amount={item.amount} />
                ))}
              </div>
            </VAccordion>
          )}
          {categoryAccordions(expenseGroups, expensesLoading, ['expense'])}
        </div>
      )}

      {(incomeGroups.length > 0 || hasOperations(operationsByReport, ['income'])) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {sectionTitle('Доходы', sectionAverage(totalOf(incomeGroups)))}
          {categoryAccordions(incomeGroups, incomesLoading, ['income'])}
        </div>
      )}

      {(savingsGroups.length > 0 ||
          hasOperations(operationsByReport, ['savings', 'savings_out'])) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {sectionTitle('Накопления', sectionAverage(totalOf(savingsGroups)))}
          {categoryAccordions(savingsGroups, savingsLoading, ['savings', 'savings_out'])}
        </div>
      )}
    </div>
  );
};
