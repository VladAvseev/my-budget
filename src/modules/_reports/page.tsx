import { useAtom } from 'jotai';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import styles from './reports.module.css';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportsList } from './components/ReportsList';
import { createModalOpenAtom } from './atoms/reports';
import { useNavigate } from 'react-router-dom';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useAtom(createModalOpenAtom);

  return (
    <div className={styles.page}>
      <VPageHeader title="Периоды" onBack={() => navigate('/')} backAriaLabel="Назад на главную" />

      <ReportsList />

      <CreateReportModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
