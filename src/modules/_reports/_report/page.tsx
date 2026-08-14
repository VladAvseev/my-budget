import { SettingsIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
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
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id ?? '');
  const { data: summary } = useSummary(id ?? '');
  const [operationModal, setOperationModal] = useAtom(operationModalAtom);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
      <VPageHeader
        title={report?.name ?? 'Отчёт'}
        onBack={() => navigate('/reports')}
        backAriaLabel="Назад к отчётам"
        right={
          report && !isLoading ? (
            <VIconButton
              ariaLabel="Настройки отчёта"
              onClick={() => navigate(`/reports/${report.id}/settings`)}
              color={styles.colors.textPrimary}
            >
              <SettingsIcon size={24} color={styles.colors.textPrimary} />
            </VIconButton>
          ) : undefined
        }
      />

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && (error || !report) && (
        <VCard>
          <div style={{ color: styles.colors.textSecondary }}>Отчёт не найден</div>
        </VCard>
      )}

      {!isLoading && !error && report && (
        <>
          <SummaryCards summary={summary} />
          <OperationsTabs report={report} />
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
