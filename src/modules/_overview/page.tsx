import type { Operation } from '@/shared/supabase/types/domain';
import { VBanner } from '@/shared/ui/VBanner';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VHint } from '@/shared/ui/VHint';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAuth } from '@/shared/supabase/authProvider';
import { useBreakpoint } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverviewOperationsMap } from './api/useOverviewOperationsMap';
import { useReports } from './api/useReports';
import { selectedReportIdsAtom, selectedDisplayCurrencyAtom } from './atoms/overview';
import { useDisplayCurrency } from './hooks/useDisplayCurrency';
import { GrowthDynamicsCard } from '@/modules/_accumulations/components/GrowthDynamicsCard';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { ReportsFilter } from './components/ReportsFilter';
import { SummaryCard } from './components/SummaryCard';
import { emptyAmounts, sumOperations } from './utils/overview';

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
  const [selectedCurrency] = useAtom(selectedDisplayCurrencyAtom);
  const setSelectedCurrency = useSetAtom(selectedDisplayCurrencyAtom);
  const {
    defaultCurrency,
    isCurrencyDisabled,
    displayCurrency,
    rates,
    displaySymbol,
  } = useDisplayCurrency();

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

  const reports = reportsQuery.data ?? [];
  const selectedReports = reports.filter((report) => selectedIds.includes(report.id));

  const {
    data: operationsMap,
    isLoading: operationsLoading,
    error: operationsError,
  } = useOverviewOperationsMap(selectedReports.map((report) => report.id));

  const operationsByReport = useMemo(
    () => operationsMap ?? new Map<string, Operation[]>(),
    [operationsMap],
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
      <div className={commonStyles.pageHeaderRow}>
        <VPageHeader
          title="Аналитика"
          onBack={() => navigate('/')}
          backAriaLabel="Назад на главную"
          hideOnMobile
        />
        {isDesktop && currencySwitcher}
      </div>

      {!isDesktop && (
        <div className={styles.currencyRow}>
          <div className={commonStyles.titleXl}>Аналитика</div>
          {currencySwitcher}
        </div>
      )}

      <GrowthDynamicsCard
        userId={userId}
        chartType="capital"
        title="Рост капитала"
        currency={{ displayCurrency, defaultCurrency, rates, displaySymbol }}
      />

      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>Отчёт по периодам</div>
      </div>

      <div className={commonStyles.animateCard}>
        <ReportsFilter reports={reports} />
      </div>

      {reportsQuery.isLoading && (
        <div className={commonStyles.loaderContainer}>
          <VLoader size={28} />
        </div>
      )}

      {reportsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить периоды" />
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
              {operationsError && (
                <VBanner type="error" visible message="Не удалось загрузить операции" />
              )}

              {operationsLoading ? (
                <div className={commonStyles.loaderContainer}>
                  <VLoader size={28} />
                </div>
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
                  <div className={commonStyles.animateCard} style={{ animationDelay: '0.18s' }}>
                    <CategoryBreakdown
                      reports={selectedReports}
                      operationsByReport={operationsByReport}
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
