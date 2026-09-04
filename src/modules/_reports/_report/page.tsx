import { SettingsIcon } from '@/shared/icons';
import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
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

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id ?? '');
  const { data: summary } = useSummary(id ?? '');
  const [operationModal, setOperationModal] = useAtom(operationModalAtom);

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title={report?.name ?? 'Период'}
        onBack={() => navigate('/reports')}
        backAriaLabel="Назад к периодам"
        right={
          report && !isLoading ? (
            <VIconButton
              ariaLabel="Настройки периода"
              onClick={() => navigate(`/reports/${report.id}/settings`)}
              color="var(--color-text-primary)"
            >
              <SettingsIcon size={24} color="currentColor" />
            </VIconButton>
          ) : undefined
        }
      />

      {isLoading && (
        <div className={commonStyles.loaderContainer}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && (error || !report) && (
        <VCard>
          <div className={commonStyles.textSecondary}>Период не найден</div>
        </VCard>
      )}

      {!isLoading && !error && report && (
        <>
          <div className={commonStyles.animateCard}>
            <SummaryCards summary={summary} />
          </div>
          <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
            <OperationsTabs report={report} />
          </div>
          {operationModal?.operation ? (
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
          )}
        </>
      )}
    </div>
  );
};