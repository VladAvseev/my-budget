import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAtom } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { useReport } from './api/useReport';
import { useSummary } from './api/useSummary';
import { operationModalAtom } from './atoms/report';
import { SummaryCards } from './components/SummaryCards';
import { OperationsTabs } from './components/OperationsTabs';
import { CreateOperationModal } from './components/CreateOperationModal';
import { EditOperationModal } from './components/EditOperationModal';
import styles from './pageSkeleton.module.css';
import layout from '../reports.module.css';
import { VErrorCard } from '@/shared/ui/VErrorCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reportId = id ?? '';
  const { data: report, isLoading, error, refetch, isFetching } = useReport(reportId);
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: summaryFetching,
  } = useSummary(reportId);
  const [operationModal, setOperationModal] = useAtom(operationModalAtom);

  const notFound = !isLoading && (Boolean(error) || report === null);

  return (
    <div className={layout.page}>
      <VPageHeader
        title={report?.name ?? 'Период'}
        onBack={() => navigate('/reports')}
        backAriaLabel="Назад к периодам"
      />

      {error && (
        <VErrorCard
          title="Не удалось загрузить период"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}
      {notFound && !error && (
        <VCard>
          <div className={commonStyles.textSecondary}>Период не найден</div>
        </VCard>
      )}

      {!notFound && (
        <>
          
          <div>
            {summaryLoading ? (
              <div className={styles.summaryGrid}>
                {[0, 1, 2].map((i) => (
                  <VSkeletonCard key={i} compact title={false} lines={2} delay={`${i * 0.05}s`} />
                ))}
              </div>
            ) : summaryError ? (
              <VErrorCard
                title="Не удалось загрузить сводку"
                error={summaryError}
                onRetry={() => void refetchSummary()}
                isRetrying={summaryFetching}
              />
            ) : (
              <SummaryCards summary={summary} />
            )}
          </div>
          <section aria-label="Операции периода">
            <OperationsTabs reportId={reportId} report={report ?? null} />
          </section>
          {report &&
            (operationModal?.operation ? (
              <EditOperationModal
                key={operationModal.operation.id}
                operation={operationModal.operation}
                report={report}
                onClose={() => setOperationModal(null)}
              />
            ) : (
              operationModal && (
                <CreateOperationModal
                  key={operationModal.type}
                  type={operationModal.type}
                  report={report}
                  onClose={() => setOperationModal(null)}
                />
              )
            ))}
        </>
      )}
    </div>
  );
};
