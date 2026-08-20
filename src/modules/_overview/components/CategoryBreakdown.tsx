import type { Operation, OperationType } from '@/shared/supabase/types/domain';
import type { Report } from '@/shared/supabase/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { Link } from 'react-router-dom';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { buildCategoryGroups, buildReportGroups, type ReportAmount } from '../utils/overview';
import styles from './CategoryBreakdown.module.css';

interface CategoryBreakdownProps {
  reports: Report[];
  operationsByReport: Map<string, Operation[]>;
}

const ReportLinkRow = ({ report, amount }: ReportAmount) => (
  <Link to={`/reports/${report.id}`} className={styles.linkRow}>
    <VCard interactive className={styles.linkRowCard}>
      <span className={styles.linkRowName}>{report.name}</span>
      <span className={styles.linkRowAmount}>{formatAmount(amount)}</span>
    </VCard>
  </Link>
);

const hasOperations = (operationsByReport: Map<string, Operation[]>, typeFilter: OperationType[]) =>
  [...operationsByReport.values()].some((operations) =>
    operations.some((operation) => typeFilter.includes(operation.type as OperationType)),
  );

const AccordionSummary = ({ total, reportCount }: { total: number; reportCount: number }) => {
  const average = reportCount > 0 ? total / reportCount : 0;

  return (
    <span className={styles.accordionSummary}>
      <span className={styles.accordionSummaryLine}>
        Всего: <span className={styles.strong}>{formatAmount(total)}</span>
      </span>
      <span className={styles.accordionSummaryLine}>
        В среднем: <span className={styles.strong}>{formatAmount(average)}</span>
      </span>
    </span>
  );
};

export const CategoryBreakdown = ({ reports, operationsByReport }: CategoryBreakdownProps) => {
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
    <div className={styles.sectionHeader}>
      <div className={styles.sectionLabel}>{label}</div>
      <div className={styles.sectionAverage}>
        В среднем: <span className={styles.strong}>{formatAmount(average)}</span>
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
        <div className={styles.loaderWrap}>
          <VLoader size={24} />
        </div>
      );
    }
    if (groups.length === 0) {
      return null;
    }
    return (
      <div className={styles.accordionList}>
        {groups.map((group, groupIndex) => (
          <div
            key={group.key}
            className={commonStyles.animateCard}
            style={{ animationDelay: `${groupIndex * 0.03}s` }}
          >
            <VAccordion
              header={
                <span className={styles.accordionHeader}>
                  <span
                    className={styles.accordionDot}
                    style={{
                      backgroundColor: group.color ?? 'var(--color-border)',
                    }}
                  />
                  <span className={styles.accordionGrow}>{group.label}</span>
                  <AccordionSummary total={group.total} reportCount={reports.length} />
                </span>
              }
            >
              <div className={styles.accordionRow}>
                {group.byReport.map((item) => (
                  <ReportLinkRow key={item.report.id} report={item.report} amount={item.amount} />
                ))}
              </div>
            </VAccordion>
          </div>
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
    <div className={styles.root}>
      {hasExpenseOrDaily && (
        <div className={styles.section}>
          {sectionTitle('Расходы', sectionAverage(totalDaily + totalOf(expenseGroups)))}
          {dailyGroups.length > 0 && (
            <VAccordion
              header={
                <span className={styles.accordionHeader}>
                  <span
                    className={styles.accordionDot}
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                  <span className={styles.accordionGrow}>Ежедневные расходы</span>
                  <AccordionSummary total={totalDaily} reportCount={reports.length} />
                </span>
              }
            >
              <div className={styles.accordionRow}>
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
        <div className={styles.section}>
          {sectionTitle('Доходы', sectionAverage(totalOf(incomeGroups)))}
          {categoryAccordions(incomeGroups, incomesLoading, ['income'])}
        </div>
      )}

      {(savingsGroups.length > 0 ||
          hasOperations(operationsByReport, ['savings', 'savings_out'])) && (
        <div className={styles.section}>
          {sectionTitle('Накопления', sectionAverage(totalOf(savingsGroups)))}
          {categoryAccordions(savingsGroups, savingsLoading, ['savings', 'savings_out'])}
        </div>
      )}
    </div>
  );
};