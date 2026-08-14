import { PlusIcon } from '@/shared/icons';
import { useAtom } from 'jotai';
import { useThemeStyles } from '@/shared/theme';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportsList } from './components/ReportsList';
import { useReports } from './api/useReports';
import { createModalOpenAtom } from './atoms/reports';
import { useNavigate } from 'react-router-dom';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useAtom(createModalOpenAtom);
  const reportsQuery = useReports();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
      <VPageHeader
        title="Отчёты"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        right={
          <VIconButton
            ariaLabel="Создать отчёт"
            onClick={() => setIsModalOpen(true)}
            isDisabled={reportsQuery.isLoading}
            color={styles.colors.accent}
          >
            <PlusIcon size={24} color={styles.colors.accent} />
          </VIconButton>
        }
      />

      <ReportsList />

      <CreateReportModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
