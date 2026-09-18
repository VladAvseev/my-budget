import { useAtom } from 'jotai';
import styles from './reports.module.css';
import { CreateReportModal } from './components/CreateReportModal';
import { ReportsList } from './components/ReportsList';
import { createModalOpenAtom } from './atoms/reports';

export const Page: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useAtom(createModalOpenAtom);

  return (
    <div className={styles.page}>
      <ReportsList />

      <CreateReportModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
