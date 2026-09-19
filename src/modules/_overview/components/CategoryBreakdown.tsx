import { Amount } from '@/shared/ui/Amount';
import type { OperationType } from '@/shared/api/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { Link } from 'react-router-dom';
import type { CategorySummaryRow } from '../api/useOverviewCategorySummary';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { buildCategoryGroups, type MonthAmount } from '../utils/overview';
import styles from './CategoryBreakdown.module.css';

interface CategoryBreakdownProps {
  months: string[];
  summaryByMonth: Map<string, CategorySummaryRow[]>;
  comparedMonth: string | null;
  comparedSummaryByMonth: Map<string, CategorySummaryRow[]>;
}

const EPSILON = 0.005;

const MonthLinkRow = ({ month, label, amount }: MonthAmount) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  return (
    <Link to={`/reports/${month}`} className={styles.reportLink}>
      <span className={styles.reportName}>{label}</span>
      <span className={styles.reportAmount}>
        <Amount value={amount} currencySymbol={displaySymbol} convert={convertOptions} />
      </span>
    </Link>
  );
};

const hasOperations = (
  summaryByMonth: Map<string, CategorySummaryRow[]>,
  typeFilter: OperationType[],
) =>
  [...summaryByMonth.values()].some((rows) =>
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
      <span className={styles.strong}>
        <Amount value={value} currencySymbol={displaySymbol} convert={convertOptions} />
      </span>
      {delta && <span className={deltaClass}> ({delta})</span>}
    </span>
  );
};

const AccordionSummary = ({
  total,
  monthCount,
  period,
}: {
  total: number;
  monthCount: number;
  period: PeriodInfo | null;
}) => {
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  const average = monthCount > 0 ? total / monthCount : 0;

  return (
    <span className={styles.accordionSummary}>
      {period && <PeriodLine {...period} average={average} />}
      <span className={styles.summaryLine}>
        В месяц:{' '}
        <span className={styles.strong}>
          <Amount value={average} currencySymbol={displaySymbol} convert={convertOptions} />
        </span>
      </span>
    </span>
  );
};

export const CategoryBreakdown = ({
  months,
  summaryByMonth,
  comparedMonth,
  comparedSummaryByMonth,
}: CategoryBreakdownProps) => {
  const { expenseCategories, incomeCategories, isLoading } = useOverviewCategories();
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const expensesLoading = isLoading;
  const incomesLoading = isLoading;

  const expenseGroups = buildCategoryGroups(months, summaryByMonth, expenseCategories, [
    'expense',
  ]);
  const incomeGroups = buildCategoryGroups(months, summaryByMonth, incomeCategories, ['income']);

  const comparedMonths = comparedMonth ? [comparedMonth] : [];
  const comparedExpenseGroups = buildCategoryGroups(
    comparedMonths,
    comparedSummaryByMonth,
    expenseCategories,
    ['expense'],
  );
  const comparedIncomeGroups = buildCategoryGroups(
    comparedMonths,
    comparedSummaryByMonth,
    incomeCategories,
    ['income'],
  );

  const comparedGroupValue = (
    groups: ReturnType<typeof buildCategoryGroups>,
    key: string,
  ): number => groups.find((group) => group.key === key)?.total ?? 0;
  const comparedTotalOf = (groups: ReturnType<typeof buildCategoryGroups>) =>
    groups.reduce((sum, group) => sum + group.total, 0);

  const periodInfo = (value: number, lowerIsBetter: boolean): PeriodInfo | null =>
    comparedMonth
      ? { name: comparedMonth, value, lowerIsBetter }
      : null;

  const sectionTitle = (label: string, average: number, period: PeriodInfo | null) => (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionLabel}>{label}</h2>
      <div className={styles.sectionSummary}>
        {period && <PeriodLine {...period} average={average} />}
        <div className={styles.sectionAverage}>
          В месяц:{' '}
          <span className={styles.strong}>
            <Amount value={average} currencySymbol={displaySymbol} convert={convertOptions} />
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
    if (loading && hasOperations(summaryByMonth, typeFilter)) {
      return <VSkeletonList count={3} cardProps={{ compact: true, title: false, lines: 1 }} />;
    }
    if (groups.length === 0) {
      return null;
    }
    return (
      <div className={styles.accordionList}>
        {groups.map((group) => (
          <div key={group.key} className={styles.category}>
            <VAccordion
              header={
                <span className={styles.accordionHeader}>
                  <span
                    className={styles.accordionDot}
                    aria-hidden="true"
                    style={{
                      ['--category-color' as string]:
                        group.color ?? 'var(--md-sys-color-outline-variant)',
                    }}
                  />
                  <span className={styles.accordionGrow}>{group.label}</span>
                  <AccordionSummary
                    total={group.total}
                    monthCount={months.length}
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
                  <MonthLinkRow key={item.month} month={item.month} label={item.label} amount={item.amount} />
                ))}
              </div>
            </VAccordion>
          </div>
        ))}
      </div>
    );
  };

  const totalOf = (groups: ReturnType<typeof buildCategoryGroups>) =>
    groups.reduce((sum, group) => sum + group.total, 0);
  const sectionAverage = (total: number) => (months.length > 0 ? total / months.length : 0);
  const hasExpense = expenseGroups.length > 0 || hasOperations(summaryByMonth, ['expense']);

  return (
    <div className={styles.root}>
      {hasExpense && (
        <section className={styles.section}>
          {sectionTitle(
            'Расходы',
            sectionAverage(totalOf(expenseGroups)),
            periodInfo(comparedTotalOf(comparedExpenseGroups), true),
          )}
          {categoryAccordions(
            expenseGroups,
            comparedExpenseGroups,
            expensesLoading,
            ['expense'],
            true,
          )}
        </section>
      )}

      {(incomeGroups.length > 0 || hasOperations(summaryByMonth, ['income'])) && (
        <section className={styles.section}>
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
        </section>
      )}
    </div>
  );
};
