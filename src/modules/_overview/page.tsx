import type { Operation } from '@/shared/supabase/services/operations';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverviewOperationsMap } from './api/useOverviewOperationsMap';
import { useReports } from './api/useReports';
import { excludedReportIdsAtom } from './atoms/overview';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { OverviewTabs } from './components/OverviewTabs';
import { SummaryCard } from './components/SummaryCard';
import { emptyAmounts, sumOperations } from './utils/overview';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const reportsQuery = useReports();
  const [excludedIds] = useAtom(excludedReportIdsAtom);

  const reports = reportsQuery.data ?? [];
  const excluded = new Set(excludedIds);
  const selectedReports = reports.filter((report) => !excluded.has(report.id));

  const operationsQueries = useOverviewOperationsMap(selectedReports.map((report) => report.id));

  const operationsByReport = useMemo(() => {
    const map = new Map<string, Operation[]>();
    selectedReports.forEach((report, index) => {
      const data = operationsQueries[index]?.data;
      if (data) {
        map.set(report.id, data);
      }
    });
    return map;
  }, [selectedReports, operationsQueries]);

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

  const operationsLoading = operationsQueries.some((query) => query.isLoading);
  const operationsError = operationsQueries.find((query) => query.error)?.error;

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Обзор"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
      />

      <OverviewTabs reports={reports} />

      {reportsQuery.isLoading && (
        <div className={commonStyles.loaderContainer}>
          <VLoader size={28} />
        </div>
      )}

      {reportsQuery.error && <VBanner type="error" visible message="Не удалось загрузить отчёты" />}

      {!reportsQuery.isLoading && !reportsQuery.error && reports.length === 0 && (
        <VCard>
          <div className={commonStyles.textSecondary}>
            Нет созданных отчётов. Создайте отчёт в разделе «Отчёты».
          </div>
        </VCard>
      )}

      {!reportsQuery.isLoading && !reportsQuery.error && reports.length > 0 && (
        <>
          {selectedReports.length === 0 && (
            <VCard>
              <div className={commonStyles.textSecondary}>
                Не выбран ни один отчёт. Выберите отчёты в списке выше.
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
                  <SummaryCard
                    income={totals.income}
                    expenses={totals.expense + totals.daily}
                    savings={totals.savings}
                  />
                  <CategoryBreakdown
                    reports={selectedReports}
                    operationsByReport={operationsByReport}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};