import type { Operation } from '@/shared/supabase/types/domain';
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
import { selectedReportIdsAtom } from './atoms/overview';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { CategoryDistributionChart } from './components/CategoryDistributionChart';
import { ReportsFilter } from './components/ReportsFilter';
import { SummaryCard } from './components/SummaryCard';
import { emptyAmounts, sumOperations } from './utils/overview';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const reportsQuery = useReports();
  const [selectedIds] = useAtom(selectedReportIdsAtom);

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

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Обзор" onBack={() => navigate('/')} backAriaLabel="Назад на главную" />

      <div className={commonStyles.animateCard}>
        <ReportsFilter reports={reports} />
      </div>

      {reportsQuery.isLoading && (
        <div className={commonStyles.loaderContainer}>
          <VLoader size={28} />
        </div>
      )}

      {reportsQuery.error && <VBanner type="error" visible message="Не удалось загрузить периоды" />}

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
                Обзор сводит информацию о доходах, расходах и накоплениях за выбранные периоды в одном месте.
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
