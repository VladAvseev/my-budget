import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/supabase/types/database.types';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const CHURN_LABELS: Array<{
  key: keyof AdminDashboardStats['churn'];
  label: string;
}> = [
  { key: 'inactive1d', label: 'День' },
  { key: 'inactive7d', label: 'Неделя' },
  { key: 'inactive30d', label: 'Месяц' },
  { key: 'inactive90d', label: 'Квартал' },
  { key: 'inactive180d', label: 'Полгода' },
  { key: 'inactive365d', label: 'Год' },
];

interface ChurnCardProps {
  stats: AdminDashboardStats['churn'];
  total: number;
}

export const ChurnCard: React.FC<ChurnCardProps> = ({ stats, total }) => {
  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Неактивные пользователи</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Показатель</span>
        <span className={styles.statHeaderCell}>Кол-во</span>
        <span className={styles.statHeaderCell}>%</span>
        {CHURN_LABELS.map(({ key, label }) => (
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
