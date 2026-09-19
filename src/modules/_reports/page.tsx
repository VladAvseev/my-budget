import styles from './reports.module.css';
import { ReportsList } from './components/ReportsList';

export const Page: React.FC = () => {
  return (
    <div className={styles.page}>
      <ReportsList />
    </div>
  );
};
