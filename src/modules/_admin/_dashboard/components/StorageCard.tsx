import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { formatBytes } from '@/shared/utils/bytes';
import { useAdminStorageBreakdown } from '../api/useAdminStorageBreakdown';
import styles from './cards.module.css';

const percentOf = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const SEGMENT_COLORS = [
  'var(--md-sys-color-primary)',
  'var(--sys-color-positive-ink)',
  'var(--md-sys-color-tertiary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-outline)',
];

export const StorageCard: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminStorageBreakdown();

  if (isLoading) {
    return (
      <VCard className={styles.card}>
        <h2 className={styles.sectionTitle}>Хранилище</h2>
        <VSkeleton width="100%" height={8} radius="var(--md-sys-shape-corner-full)" />
        <div className={styles.skeletonRows}>
          {[0, 1, 2, 3].map((i) => (
            <VSkeleton key={i} width="100%" height={24} radius="var(--md-sys-shape-corner-extra-small)" />
          ))}
        </div>
      </VCard>
    );
  }

  if (isError || !data) {
    return (
      <VErrorCard
        title="Не удалось загрузить данные хранилища"
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const { databaseBytes, tables } = data;
  const tablesBytes = tables.reduce((sum, table) => sum + table.sizeBytes, 0);
  const otherBytes = Math.max(0, databaseBytes - tablesBytes);

  return (
    <VCard className={styles.card}>
      <h2 className={styles.sectionTitle}>Хранилище</h2>

      <div className={styles.distributionBar} title="Распределение объема базы данных">
        {tables.map((table, idx) => {
          const pct = percentOf(table.sizeBytes, databaseBytes);
          if (pct < 1) return null;
          return (
            <div
              key={table.name}
              className={styles.distributionSegment}
              style={{
                width: `${pct}%`,
                backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
              }}
              title={`${table.name}: ${pct}% (${formatBytes(table.sizeBytes)})`}
            />
          );
        })}
        {otherBytes > 0 && (
          <div
            className={styles.distributionSegment}
            style={{
              width: `${percentOf(otherBytes, databaseBytes)}%`,
              backgroundColor: 'var(--md-sys-color-outline-variant)',
            }}
            title={`Остальные данные: ${percentOf(otherBytes, databaseBytes)}%`}
          />
        )}
      </div>

      <div className={styles.tableScroll}>
        <div className={styles.statGrid}>
          <span className={styles.statHeaderCell}>Объект</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Размер</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Доля</span>

          <span className={styles.statRowGroup}>
            <span className={styles.statLabel}>База данных</span>
            <span className={styles.statValue}>{formatBytes(databaseBytes)}</span>
            <span className={styles.statPercent}>100%</span>
          </span>

          {tables.map((table, idx) => {
            const pct = percentOf(table.sizeBytes, databaseBytes);
            return (
              <span key={table.name} className={styles.statRowGroup}>
                <span className={styles.statLabel}>{table.name}</span>
                <span className={styles.statValue}>{formatBytes(table.sizeBytes)}</span>
                <span className={styles.percentWithBar}>
                  <span>{pct}%</span>
                  <span className={styles.miniTrack}>
                    <span
                      className={styles.miniFill}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                      }}
                    />
                  </span>
                </span>
              </span>
            );
          })}

          <span className={styles.statRowGroup}>
            <span className={styles.statLabel}>Остальные данные</span>
            <span className={styles.statValue}>{formatBytes(otherBytes)}</span>
            <span className={styles.percentWithBar}>
              <span>{percentOf(otherBytes, databaseBytes)}%</span>
              <span className={styles.miniTrack}>
                <span
                  className={styles.miniFillInactive}
                  style={{ width: `${percentOf(otherBytes, databaseBytes)}%` }}
                />
              </span>
            </span>
          </span>
        </div>
      </div>
    </VCard>
  );
};
