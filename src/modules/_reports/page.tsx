import { PlusIcon } from '@/shared/icons';
import { useAtom } from 'jotai';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportsList } from './components/ReportsList';
import { useReports } from './api/useReports';
import { createModalOpenAtom } from './atoms/reports';
import { useNavigate } from 'react-router-dom';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useAtom(createModalOpenAtom);
  const reportsQuery = useReports();

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Отчёты"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        right={
          <VIconButton
            ariaLabel="Создать отчёт"
            onClick={() => setIsModalOpen(true)}
            isDisabled={reportsQuery.isLoading}
            color="var(--color-accent)"
          >
            <PlusIcon size={24} color="currentColor" />
          </VIconButton>
        }
      />

      <ReportsList />

      <CreateReportModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};