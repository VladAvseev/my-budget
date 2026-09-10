import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { formatBytes } from '@/shared/utils/bytes';
import { useAdminStorageBreakdown } from '../api/useAdminStorageBreakdown';
import styles from './cards.module.css';

const percentOf = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

export const StorageCard: React.FC = () => {
  const { data, isLoading, isError } = useAdminStorageBreakdown();

  if (isLoading) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>Хранилище</div>
        <div className={styles.statLabel}>Загрузка…</div>
      </VCard>
    );
  }

  if (isError || !data) {
    return (
      <VCard className={styles.card}>
        <div className={commonStyles.cardTitle}>Хранилище</div>
        <div className={styles.statLabel}>Не удалось загрузить</div>
      </VCard>
    );
  }

  const { databaseBytes, tables } = data;
  const tablesBytes = tables.reduce((sum, table) => sum + table.sizeBytes, 0);
  const otherBytes = Math.max(0, databaseBytes - tablesBytes);

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Хранилище</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Объект</span>
        <span className={styles.statHeaderCell}>Размер</span>
        <span className={styles.statHeaderCell}>%</span>

        <span className={styles.statRowGroup}>
          <span className={styles.statLabel}>База данных</span>
          <span className={styles.statValue}>{formatBytes(databaseBytes)}</span>
          <span className={styles.statPercent}>100%</span>
        </span>

        {tables.map((table) => (
          <span key={table.name} className={styles.statRowGroup}>
            <span className={styles.statLabel}>{table.name}</span>
            <span className={styles.statValue}>{formatBytes(table.sizeBytes)}</span>
            <span className={styles.statPercent}>{percentOf(table.sizeBytes, databaseBytes)}%</span>
          </span>
        ))}

        <span className={styles.statRowGroup}>
          <span className={styles.statLabel}>Остальные данные</span>
          <span className={styles.statValue}>{formatBytes(otherBytes)}</span>
          <span className={styles.statPercent}>{percentOf(otherBytes, databaseBytes)}%</span>
        </span>
      </div>
    </VCard>
  );
};
