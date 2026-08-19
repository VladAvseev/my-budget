import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { useAdminSupportStatus } from '../api/useAdminSupportStatus';
import styles from './cards.module.css';

const formatHours = (hours: number | null): string => {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  return `${hours.toFixed(1)} ч`;
};

export const SupportStatusCard: React.FC = () => {
  const statusQuery = useAdminSupportStatus();

  if (statusQuery.isLoading) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>Обращения</div>
        <div className={commonStyles.loaderContainer}>
          <VLoader size={24} />
        </div>
      </VCard>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>Обращения</div>
        <div className={commonStyles.textSecondary}>Не удалось загрузить</div>
      </VCard>
    );
  }

  const { open, unanswered, avgResponseHours } = statusQuery.data;

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Обращения</div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Открыто</span>
        <span className={styles.valuePrimary}>{open}</span>
      </div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Без ответа &gt; суток</span>
        <span
          className={
            unanswered > 0 ? styles.valueWarning : styles.valuePrimary
          }
        >
          {unanswered}
        </span>
      </div>
      <div className={commonStyles.infoRow}>
        <span className={styles.valuePrimary}>Среднее время ответа</span>
        <span className={styles.valuePrimary}>{formatHours(avgResponseHours)}</span>
      </div>
    </VCard>
  );
};