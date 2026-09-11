import type { Operation } from '@/shared/api/types/domain';
import { VBanner } from '@/shared/ui/VBanner';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VCurrencyRates } from '@/shared/ui/VCurrencyRates';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VHint } from '@/shared/ui/VHint';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAuth } from '@/shared/api/authProvider';
import { useBreakpoint } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverviewOperationsMap } from './api/useOverviewOperationsMap';
import { useReports } from './api/useReports';
import {
  comparedReportIdAtom,
  selectedReportIdsAtom,
  selectedDisplayCurrencyAtom,
} from './atoms/overview';
import { useDisplayCurrency } from './hooks/useDisplayCurrency';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { GrowthDynamicsCard } from './components/GrowthDynamicsCard';
import { PeriodCompareSelect } from './components/PeriodCompareSelect';
import { ReportsFilter } from './components/ReportsFilter';
import { SummaryCard } from './components/SummaryCard';
import { emptyAmounts, sumOperations } from '@/shared/utils';

const CURRENCY_OPTIONS: VButtonGroupOption[] = [
  { value: 'BYN', label: 'BYN' },
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
];

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const userId = user?.id ?? '';
  const reportsQuery = useReports();
  const [selectedIds] = useAtom(selectedReportIdsAtom);
  const [comparedId] = useAtom(comparedReportIdAtom);
  const [selectedCurrency] = useAtom(selectedDisplayCurrencyAtom);
  const setSelectedCurrency = useSetAtom(selectedDisplayCurrencyAtom);
  const { defaultCurrency, isCurrencyDisabled, displayCurrency, rates, displaySymbol } =
    useDisplayCurrency();

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const selectedReports = reports.filter((report) => selectedIds.includes(report.id));

  const {
    data: operationsMap,
    isLoading: operationsLoading,
    error: operationsError,
    refetch: refetchOperations,
    isFetching: operationsFetching,
  } = useOverviewOperationsMap(selectedReports.map((report) => report.id));

  const operationsByReport = useMemo(
    () => operationsMap ?? new Map<string, Operation[]>(),
    [operationsMap],
  );

  const comparedReport = useMemo(
    () => reports.find((report) => report.id === comparedId) ?? null,
    [reports, comparedId],
  );

  const { data: comparedOperationsMap, isLoading: comparedOperationsLoading } =
    useOverviewOperationsMap(comparedReport ? [comparedReport.id] : []);

  const comparedOperationsByReport = useMemo(
    () => comparedOperationsMap ?? new Map<string, Operation[]>(),
    [comparedOperationsMap],
  );

  const totals = useMemo(() => {
    const total = { ...emptyAmounts };
    for (const operations of operationsByReport.values()) {
      const partial = sumOperations(operations);
      total.income += partial.income;
      total.expense += partial.expense;
      total.savings += partial.savings;
      total.daily += partial.daily;
    }
    return total;
  }, [operationsByReport]);

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
    <div className={commonStyles.page}>
      {isDesktop && (
        <div className={commonStyles.pageHeaderRow}>
          <VPageHeader
            title="Аналитика"
            onBack={() => navigate('/')}
            backAriaLabel="Назад на главную"
          />
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

      <GrowthDynamicsCard
        userId={userId}
        title="Рост капитала"
        currency={{ displayCurrency, defaultCurrency, rates, displaySymbol }}
      />

      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>Отчёт по периодам</div>
      </div>

      <div className={commonStyles.animateCard}>
        <ReportsFilter reports={reports} />
      </div>

      {reportsQuery.isLoading && <VSkeletonCard compact title={false} lines={1} />}

      {reportsQuery.error && (
        <VErrorCard
          title="Не удалось загрузить периоды"
          error={reportsQuery.error}
          onRetry={() => void reportsQuery.refetch()}
          isRetrying={reportsQuery.isFetching}
        />
      )}

      {!reportsQuery.isLoading && !reportsQuery.error && reports.length === 0 && (
        <VCard>
          <div className={commonStyles.emptyTitle}>Нет периодов</div>
          <div className={commonStyles.emptyHint}>
            Добавьте период в разделе «Периоды», чтобы увидеть обзор.
          </div>
        </VCard>
      )}

      {!reportsQuery.isLoading && !reportsQuery.error && reports.length > 0 && (
        <>
          {selectedReports.length === 0 && (
            <VCard>
              <div className={commonStyles.emptyTitle}>Не выбран ни один период</div>
              <div className={commonStyles.emptyHint}>
                Аналитика сводит информацию о доходах, расходах и накоплениях за выбранные периоды в
                одном месте.
                <br />
                Выберите периоды в списке выше.
              </div>
            </VCard>
          )}

          {selectedReports.length > 0 && (
            <>
              {operationsError && operationsMap == null && (
                <VErrorCard
                  title="Не удалось загрузить операции"
                  error={operationsError}
                  onRetry={() => void refetchOperations()}
                  isRetrying={operationsFetching}
                />
              )}

              {operationsError && operationsMap != null && (
                <VBanner type="error" visible message="Не удалось загрузить операции" />
              )}

              {operationsLoading ? (
                <>
                  <div className={styles.summaryGrid}>
                    {[0, 1, 2, 3].map((i) => (
                      <VSkeletonCard
                        key={i}
                        compact
                        title={false}
                        lines={2}
                        delay={`${i * 0.05}s`}
                      />
                    ))}
                  </div>
                  <VSkeletonCard compact lines={4} />
                  <VSkeletonCard compact title={false} lines={1} />
                  <VSkeletonCard compact lines={5} />
                </>
              ) : (
                <>
                  <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
                    <SummaryCard
                      income={totals.income}
                      expenses={totals.expense + totals.daily}
                      savings={totals.savings}
                    />
                  </div>
                  <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
                    <CategoryDistributionChart operationsByReport={operationsByReport} />
                  </div>
                  <div className={commonStyles.animateCard} style={{ animationDelay: '0.15s' }}>
                    <PeriodCompareSelect reports={reports} isLoading={comparedOperationsLoading} />
                  </div>
                  <div className={commonStyles.animateCard} style={{ animationDelay: '0.18s' }}>
                    <CategoryBreakdown
                      reports={selectedReports}
                      operationsByReport={operationsByReport}
                      comparedReport={comparedOperationsMap ? comparedReport : null}
                      comparedOperationsByReport={comparedOperationsByReport}
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
