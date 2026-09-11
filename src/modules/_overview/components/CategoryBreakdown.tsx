import type { OperationType } from '@/shared/api/types/domain';
import type { Report } from '@/shared/api/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VCard } from '@/shared/ui/VCard';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { Link } from 'react-router-dom';
import type { CategorySummaryRow } from '../api/useOverviewCategorySummary';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { buildCategoryGroups, buildReportGroups, type ReportAmount } from '../utils/overview';
import styles from './CategoryBreakdown.module.css';

interface CategoryBreakdownProps {
  reports: Report[];
  summaryByReport: Map<string, CategorySummaryRow[]>;
  comparedReport: Report | null;
  comparedSummaryByReport: Map<string, CategorySummaryRow[]>;
}

const EPSILON = 0.005;

const ReportLinkRow = ({ report, amount }: ReportAmount) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  return (
    <Link to={`/reports/${report.id}`} className={styles.linkRow}>
      <VCard interactive className={styles.linkRowCard}>
        <span className={styles.linkRowName}>{report.name}</span>
        <span className={styles.linkRowAmount}>
          {formatAmount(amount, displaySymbol, convertOptions)}
        </span>
      </VCard>
    </Link>
  );
};

const hasOperations = (
  summaryByReport: Map<string, CategorySummaryRow[]>,
  typeFilter: OperationType[],
) =>
  [...summaryByReport.values()].some((rows) =>
    rows.some((row) => typeFilter.includes(row.type as OperationType)),
  );

interface PeriodInfo {
  name: string;
  value: number;
  lowerIsBetter: boolean;
}

const PeriodLine = ({ name, value, average, lowerIsBetter }: PeriodInfo & { average: number }) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  const diff = value - average;
  const isEven = Math.abs(diff) < EPSILON;
  const isGood = lowerIsBetter ? diff < 0 : diff > 0;

  let delta: string | null = null;
  let deltaClass = styles.deltaEven;
  if (isEven) {
    delta = '0%';
  } else if (average !== 0) {
    delta = `${diff > 0 ? '+' : '-'}${Math.round((Math.abs(diff) / Math.abs(average)) * 100)}%`;
    deltaClass = isGood ? styles.deltaGood : styles.deltaBad;
  }

  return (
    <span className={styles.summaryLine}>
      {name}:{' '}
      <span className={styles.strong}>{formatAmount(value, displaySymbol, convertOptions)}</span>
      {delta && <span className={deltaClass}> ({delta})</span>}
    </span>
  );
};

const AccordionSummary = ({
  total,
  reportCount,
  period,
}: {
  total: number;
  reportCount: number;
  period: PeriodInfo | null;
}) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  const average = reportCount > 0 ? total / reportCount : 0;

  return (
    <span className={styles.accordionSummary}>
      {period && <PeriodLine {...period} average={average} />}
      <span className={styles.summaryLine}>
        В месяц:{' '}
        <span className={styles.strong}>
          {formatAmount(average, displaySymbol, convertOptions)}
        </span>
      </span>
    </span>
  );
};

export const CategoryBreakdown = ({
  reports,
  summaryByReport,
  comparedReport,
  comparedSummaryByReport,
}: CategoryBreakdownProps) => {
  const { expenseCategories, incomeCategories, savingsCategories } = useOverviewCategories();
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const expensesLoading = expenseCategories.isLoading;
  const incomesLoading = incomeCategories.isLoading;
  const savingsLoading = savingsCategories.isLoading;

  const dailyGroups = buildReportGroups(reports, summaryByReport, ['daily']);
  const expenseGroups = buildCategoryGroups(
    reports,
    summaryByReport,
    expenseCategories.data ?? [],
    ['expense'],
  );
  const incomeGroups = buildCategoryGroups(
    reports,
    summaryByReport,
    incomeCategories.data ?? [],
    ['income'],
  );
  const savingsGroups = buildCategoryGroups(
    reports,
    summaryByReport,
    savingsCategories.data ?? [],
    ['savings', 'savings_out'],
  );

  const comparedReports = comparedReport ? [comparedReport] : [];
  const comparedDaily = buildReportGroups(comparedReports, comparedSummaryByReport, ['daily']);
  const comparedExpenseGroups = buildCategoryGroups(
    comparedReports,
    comparedSummaryByReport,
    expenseCategories.data ?? [],
    ['expense'],
  );
  const comparedIncomeGroups = buildCategoryGroups(
    comparedReports,
    comparedSummaryByReport,
    incomeCategories.data ?? [],
    ['income'],
  );
  const comparedSavingsGroups = buildCategoryGroups(
    comparedReports,
    comparedSummaryByReport,
    savingsCategories.data ?? [],
    ['savings', 'savings_out'],
  );

  const comparedDailyTotal = comparedDaily.reduce((sum, item) => sum + item.amount, 0);
  const comparedGroupValue = (
    groups: ReturnType<typeof buildCategoryGroups>,
    key: string,
  ): number => groups.find((group) => group.key === key)?.total ?? 0;
  const comparedTotalOf = (groups: ReturnType<typeof buildCategoryGroups>) =>
    groups.reduce((sum, group) => sum + group.total, 0);

  const periodInfo = (value: number, lowerIsBetter: boolean): PeriodInfo | null =>
    comparedReport ? { name: comparedReport.name, value, lowerIsBetter } : null;

  const sectionTitle = (label: string, average: number, period: PeriodInfo | null) => (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionLabel}>{label}</div>
      <div className={styles.sectionSummary}>
        {period && <PeriodLine {...period} average={average} />}
        <div className={styles.sectionAverage}>
          В месяц:{' '}
          <span className={styles.strong}>
            {formatAmount(average, displaySymbol, convertOptions)}
          </span>
        </div>
      </div>
    </div>
  );

  const categoryAccordions = (
    groups: ReturnType<typeof buildCategoryGroups>,
    comparedGroups: ReturnType<typeof buildCategoryGroups>,
    loading: boolean,
    typeFilter: OperationType[],
    lowerIsBetter: boolean,
  ) => {
    if (loading && hasOperations(summaryByReport, typeFilter)) {
      return <VSkeletonList count={3} cardProps={{ compact: true, title: false, lines: 1 }} />;
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
                  <AccordionSummary
                    total={group.total}
                    reportCount={reports.length}
                    period={periodInfo(
                      comparedGroupValue(comparedGroups, group.key),
                      lowerIsBetter,
                    )}
                  />
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
    hasOperations(summaryByReport, ['expense']);

  return (
    <div className={styles.root}>
      {hasExpenseOrDaily && (
        <div className={styles.section}>
          {sectionTitle(
            'Расходы',
            sectionAverage(totalDaily + totalOf(expenseGroups)),
            periodInfo(comparedDailyTotal + comparedTotalOf(comparedExpenseGroups), true),
          )}
          {dailyGroups.length > 0 && (
            <VAccordion
              header={
                <span className={styles.accordionHeader}>
                  <span
                    className={styles.accordionDot}
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                  <span className={styles.accordionGrow}>Ежедневные расходы</span>
                  <AccordionSummary
                    total={totalDaily}
                    reportCount={reports.length}
                    period={periodInfo(comparedDailyTotal, true)}
                  />
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
          {categoryAccordions(
            expenseGroups,
            comparedExpenseGroups,
            expensesLoading,
            ['expense'],
            true,
          )}
        </div>
      )}

      {(incomeGroups.length > 0 || hasOperations(summaryByReport, ['income'])) && (
        <div className={styles.section}>
          {sectionTitle(
            'Доходы',
            sectionAverage(totalOf(incomeGroups)),
            periodInfo(comparedTotalOf(comparedIncomeGroups), false),
          )}
          {categoryAccordions(
            incomeGroups,
            comparedIncomeGroups,
            incomesLoading,
            ['income'],
            false,
          )}
        </div>
      )}

      {(savingsGroups.length > 0 ||
        hasOperations(summaryByReport, ['savings', 'savings_out'])) && (
        <div className={styles.section}>
          {sectionTitle(
            'Накопления',
            sectionAverage(totalOf(savingsGroups)),
            periodInfo(comparedTotalOf(comparedSavingsGroups), false),
          )}
          {categoryAccordions(
            savingsGroups,
            comparedSavingsGroups,
            savingsLoading,
            ['savings', 'savings_out'],
            false,
          )}
        </div>
      )}
    </div>
  );
};
