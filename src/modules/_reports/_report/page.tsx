import { SettingsIcon } from '@/shared/icons';
import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
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

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reportId = id ?? '';
  const { data: report, isLoading, error } = useReport(reportId);
  const { data: summary, isLoading: summaryLoading } = useSummary(reportId);
  const [operationModal, setOperationModal] = useAtom(operationModalAtom);

  const notFound = !isLoading && (Boolean(error) || report === null);

  return (
    <div className={commonStyles.page}>
      <div className={commonStyles.pageHeaderRow}>
        <VPageHeader
          title={report?.name ?? 'Период'}
          onBack={() => navigate('/reports')}
          backAriaLabel="Назад к периодам"
        />
        {report && (
          <VIconButton
            ariaLabel="Настройки периода"
            onClick={() => navigate(`/reports/${report.id}/settings`)}
            color="var(--color-text-primary)"
          >
            <SettingsIcon size={24} color="currentColor" />
          </VIconButton>
        )}
      </div>

      {notFound && (
        <VCard>
          <div className={commonStyles.textSecondary}>Период не найден</div>
        </VCard>
      )}

      {!notFound && (
        <>
          {/* Вкладки монтируются сразу: операции/категории/лимиты запрашиваются
              параллельно с отчётом, а не дождавшись его. */}
          <div className={commonStyles.animateCard}>
            {summaryLoading ? (
              <div className={styles.summaryGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <VSkeletonCard key={i} compact title={false} lines={2} delay={`${i * 0.05}s`} />
                ))}
              </div>
            ) : (
              <SummaryCards summary={summary} />
            )}
          </div>
          <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
            <OperationsTabs reportId={reportId} report={report ?? undefined} />
          </div>
          {report &&
            (operationModal?.operation ? (
              <EditOperationModal
                key={operationModal.operation.id}
                operation={operationModal.operation}
                report={report}
                onClose={() => setOperationModal(null)}
                isDeletable={operationModal.isDeletable}
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
