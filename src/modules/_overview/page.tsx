import { VBanner } from '@/shared/ui/VBanner';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VCurrencyRates } from '@/shared/widgets/CurrencyRates';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VHint } from '@/shared/ui/VHint';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { useBreakpoint } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import {
  useOverviewCategorySummary,
  type CategorySummaryRow,
} from './api/useOverviewCategorySummary';
import { useOperationMonths } from '@/shared/api/hooks/useOperationMonths';
import {
  comparedMonthAtom,
  selectedDisplayCurrencyAtom,
  selectedMonthsAtom,
} from './atoms/overview';
import { useDisplayCurrency } from './hooks/useDisplayCurrency';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { PeriodCompareSelect } from './components/PeriodCompareSelect';
import { ReportsFilter } from './components/ReportsFilter';
import { SummaryCard } from './components/SummaryCard';
import { sumCategorySummary } from './utils/overview';

const CURRENCY_OPTIONS: VButtonGroupOption[] = [
  { value: 'BYN', label: 'BYN' },
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
];

export const Page: React.FC = () => {
  const { isDesktop } = useBreakpoint();
  const monthsQuery = useOperationMonths();
  const [selectedMonths] = useAtom(selectedMonthsAtom);
  const [comparedMonth] = useAtom(comparedMonthAtom);
  const [selectedCurrency] = useAtom(selectedDisplayCurrencyAtom);
  const setSelectedCurrency = useSetAtom(selectedDisplayCurrencyAtom);
  const { defaultCurrency, isCurrencyDisabled, displayCurrency, rates } = useDisplayCurrency();

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

  const months = useMemo(() => monthsQuery.data ?? [], [monthsQuery.data]);
  const selected = useMemo(
    () => selectedMonths.filter((month) => months.includes(month)),
    [selectedMonths, months],
  );

  const {
    data: summaryMap,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: summaryFetching,
  } = useOverviewCategorySummary(selected);

  const summaryByMonth = useMemo(
    () => summaryMap ?? new Map<string, CategorySummaryRow[]>(),
    [summaryMap],
  );

  const compared = comparedMonth && months.includes(comparedMonth) ? comparedMonth : null;

  const { data: comparedSummaryMap, isLoading: comparedSummaryLoading } =
    useOverviewCategorySummary(compared ? [compared] : []);

  const comparedSummaryByMonth = useMemo(
    () => comparedSummaryMap ?? new Map<string, CategorySummaryRow[]>(),
    [comparedSummaryMap],
  );

  const totals = useMemo(() => sumCategorySummary(summaryByMonth), [summaryByMonth]);

  const currencySwitcher = isCurrencyDisabled ? (
    <VHint hint="Сначала выберите валюту в профиле" position="bottom-end">
      <VButtonGroup
        options={CURRENCY_OPTIONS}
        value={selectedCurrency}
        onChange={(value) => setSelectedCurrency(value as string)}
        disabled={isCurrencyDisabled}
      />
    </VHint>
  ) : (
    <VButtonGroup
      options={CURRENCY_OPTIONS}
      value={selectedCurrency}
      onChange={(value) => setSelectedCurrency(value as string)}
      disabled={isCurrencyDisabled}
    />
  );

  return (
    <div className={styles.page}>
      {isDesktop && (
        <div className={styles.header}>
          <div className={styles.headerActions}>
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="row" />
            {currencySwitcher}
          </div>
        </div>
      )}

      {!isDesktop && (
        <div className={styles.currencyRow}>
          {displayCurrency ? (
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="stack" />
          ) : (
            <div className={commonStyles.titleXl}>Аналитика</div>
          )}
          {currencySwitcher}
        </div>
      )}

      <div className={styles.block}>
        <ReportsFilter months={months} />
      </div>

      {monthsQuery.isLoading && <VSkeletonCard compact title={false} lines={1} />}

      {monthsQuery.error && (
        <VErrorCard
          title="Не удалось загрузить периоды"
          error={monthsQuery.error}
          onRetry={() => void monthsQuery.refetch()}
          isRetrying={monthsQuery.isFetching}
        />
      )}

      {!monthsQuery.isLoading && !monthsQuery.error && months.length === 0 && (
        <VCard>
          <div className={commonStyles.emptyTitle}>Нет операций</div>
          <div className={commonStyles.emptyHint}>
            Добавьте первую операцию, чтобы увидеть обзор.
          </div>
        </VCard>
      )}

      {!monthsQuery.isLoading && !monthsQuery.error && months.length > 0 && (
        <>
          {selected.length === 0 && (
            <VCard>
              <div className={commonStyles.emptyTitle}>Не выбран ни один период</div>
              <div className={commonStyles.emptyHint}>
                Аналитика сводит информацию о доходах и расходах за выбранные периоды в одном месте.
                <br />
                Выберите периоды в списке выше.
              </div>
            </VCard>
          )}

          {selected.length > 0 && (
            <>
              {summaryError && summaryMap == null && (
                <VErrorCard
                  title="Не удалось загрузить операции"
                  error={summaryError}
                  onRetry={() => void refetchSummary()}
                  isRetrying={summaryFetching}
                />
              )}

              {summaryError && summaryMap != null && (
                <VBanner type="error" visible message="Не удалось загрузить операции" />
              )}

              {summaryLoading ? (
                <>
                  <div className={styles.summaryGrid}>
                    {[0, 1, 2].map((i) => (
                      <VSkeletonCard key={i} compact title={false} lines={2} />
                    ))}
                  </div>
                  <VSkeletonCard compact lines={4} />
                  <VSkeletonCard compact title={false} lines={1} />
                  <VSkeletonCard compact lines={5} />
                </>
              ) : (
                <>
                  <div className={styles.block}>
                    <SummaryCard income={totals.income} expenses={totals.expense} />
                  </div>
                  <div className={styles.block}>
                    <CategoryDistributionChart summaryByReport={summaryByMonth} />
                  </div>
                  <div className={styles.block}>
                    <PeriodCompareSelect months={months} isLoading={comparedSummaryLoading} />
                  </div>
                  <div className={styles.block}>
                    <CategoryBreakdown
                      months={selected}
                      summaryByMonth={summaryByMonth}
                      comparedMonth={comparedSummaryMap ? compared : null}
                      comparedSummaryByMonth={comparedSummaryByMonth}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
