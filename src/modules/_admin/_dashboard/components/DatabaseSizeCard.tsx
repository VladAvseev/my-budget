import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import { useAdminDatabaseSize } from '../api/useAdminDatabaseSize';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const DB_SIZE_LIMIT_MB = 500;
const LIMIT_BYTES = DB_SIZE_LIMIT_MB * 1024 * 1024;

const percentClass = (percent: number): string => {
  if (percent >= 90) return styles.fillError;
  if (percent >= 70) return styles.fillWarning;
  return styles.fillSuccess;
};

export const DatabaseSizeCard: React.FC = () => {
  const sizeQuery = useAdminDatabaseSize();

  if (sizeQuery.isLoading) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>База данных</div>
        <div className={commonStyles.loaderContainer}>
          <VLoader size={24} />
        </div>
      </VCard>
    );
  }

  if (sizeQuery.isError || !sizeQuery.data) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>База данных</div>
        <div className={commonStyles.textSecondary}>Не удалось загрузить</div>
      </VCard>
    );
  }

  const { sizeBytes, sizePretty } = sizeQuery.data;
  const percent = Math.min(100, Math.round((sizeBytes / LIMIT_BYTES) * 100));

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>База данных</div>
      <div className={styles.progressTrack}>
        <div className={`${styles.progressFill} ${percentClass(percent)}`} style={{ width: `${percent}%` }} />
      </div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Использовано</span>
        <span className={styles.valuePrimary}>{sizePretty}</span>
      </div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Лимит</span>
        <span className={styles.valuePrimary}>{DB_SIZE_LIMIT_MB} МБ</span>
      </div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Заполненность</span>
        <span className={commonStyles.infoValueBold}>{percent}%</span>
      </div>
    </VCard>
  );
};