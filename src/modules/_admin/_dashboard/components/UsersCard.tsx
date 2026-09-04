import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

interface UsersCardProps {
  stats: AdminDashboardStats['users'];
}

interface UsersRow {
  label: string;
  value: number;
}

export const UsersCard: React.FC<UsersCardProps> = ({ stats }) => {
  const { total, withoutReports, onboarded, sawNews } = stats;

  const rows: UsersRow[] = [
    { label: 'Всего', value: total },
    { label: 'Без периодов', value: withoutReports },
    { label: 'Прошли онбординг', value: onboarded },
    { label: 'Увидели новости', value: sawNews },
  ];

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Пользователи</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Показатель</span>
        <span className={styles.statHeaderCell}>Кол-во</span>
        <span className={styles.statHeaderCell}>%</span>
        {rows.map(({ label, value }) => (
          <span key={label} className={styles.statRowGroup}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statPercent}>{percent(value, total)}%</span>
          </span>
        ))}
      </div>
    </VCard>
  );
};
