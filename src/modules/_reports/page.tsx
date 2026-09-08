import { useAtom } from 'jotai';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportsList } from './components/ReportsList';
import { createModalOpenAtom } from './atoms/reports';
import { useNavigate } from 'react-router-dom';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useAtom(createModalOpenAtom);

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Периоды"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        hideOnMobile
      />

      <ReportsList />

      <CreateReportModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
