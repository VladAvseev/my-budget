import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAtom } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { useSummary } from './api/useMonthSummary';
import { operationModalAtom } from './atoms/report';
import { SummaryCards } from './components/SummaryCards';
import { OperationsTabs } from './components/OperationsTabs';
import { CreateOperationModal } from './components/CreateOperationModal';
import { EditOperationModal } from './components/EditOperationModal';
import { formatMonthTitle, isPeriodMonth } from '@/shared/utils';
import styles from './pageSkeleton.module.css';
import layout from '../reports.module.css';
import { VErrorCard } from '@/shared/ui/VErrorCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { month } = useParams<{ month: string }>();
  const monthCode = month ?? '';
  const valid = isPeriodMonth(monthCode);
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: summaryFetching,
  } = useSummary(valid ? monthCode : '');
  const [operationModal, setOperationModal] = useAtom(operationModalAtom);

  const notFound = !valid;

  return (
    <div className={layout.page}>
      <VPageHeader
        title={valid ? formatMonthTitle(monthCode) : 'Период'}
        onBack={() => navigate('/reports')}
        backAriaLabel="Назад к периодам"
      />

      {notFound && (
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
            <OperationsTabs month={monthCode} />
          </section>
          {operationModal?.operation ? (
            <EditOperationModal
              key={operationModal.operation.id}
              operation={operationModal.operation}
              month={monthCode}
              onClose={() => setOperationModal(null)}
            />
          ) : (
            operationModal && (
              <CreateOperationModal
                key={operationModal.type}
                type={operationModal.type}
                month={monthCode}
                onClose={() => setOperationModal(null)}
              />
            )
          )}
        </>
      )}
    </div>
  );
};
