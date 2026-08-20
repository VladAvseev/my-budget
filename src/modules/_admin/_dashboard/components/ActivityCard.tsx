import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const ACTIVITY_LABELS: Array<{ key: keyof AdminDashboardStats['activity']; label: string }> = [
  { key: 'dau', label: 'DAU' },
  { key: 'wau', label: 'WAU' },
  { key: 'mau', label: 'MAU' },
  { key: 'qau', label: 'QAU' },
  { key: 'sau', label: 'SAU' },
  { key: 'yau', label: 'YAU' },
];

interface ActivityCardProps {
  stats: AdminDashboardStats['activity'];
  total: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ stats, total }) => {
  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Активность</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Показатель</span>
        <span className={styles.statHeaderCell}>Кол-во</span>
        <span className={styles.statHeaderCell}>%</span>
        {ACTIVITY_LABELS.map(({ key, label }) => (
          <span key={key} className={styles.statRowGroup}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{stats[key]}</span>
            <span className={styles.statPercent}>{percent(stats[key], total)}%</span>
          </span>
        ))}
      </div>
    </VCard>
  );
};
