import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

interface UsersActivityCardProps {
  users: AdminDashboardStats['users'];
  activity: AdminDashboardStats['activity'];
  churn: AdminDashboardStats['churn'];
}

interface UserRow {
  label: string;
  value: number;
}

interface ActivityRow {
  period: string;
  active: number;
  inactive: number;
}

const ACTIVITY_ROWS: Array<{
  period: string;
  activeKey: keyof AdminDashboardStats['activity'];
  inactiveKey: keyof AdminDashboardStats['churn'];
}> = [
  { period: 'День', activeKey: 'dau', inactiveKey: 'inactive1d' },
  { period: 'Неделя', activeKey: 'wau', inactiveKey: 'inactive7d' },
  { period: 'Месяц', activeKey: 'mau', inactiveKey: 'inactive30d' },
  { period: 'Квартал', activeKey: 'qau', inactiveKey: 'inactive90d' },
  { period: 'Полгода', activeKey: 'sau', inactiveKey: 'inactive180d' },
  { period: 'Год', activeKey: 'yau', inactiveKey: 'inactive365d' },
];

export const UsersActivityCard: React.FC<UsersActivityCardProps> = ({ users, activity, churn }) => {
  const { total, withoutReports, onboarded } = users;

  const userRows: UserRow[] = [
    { label: 'Всего', value: total },
    { label: 'Без периодов', value: withoutReports },
    { label: 'Прошли онбординг', value: onboarded },
  ];

  const activityRows: ActivityRow[] = ACTIVITY_ROWS.map(({ period, activeKey, inactiveKey }) => ({
    period,
    active: activity[activeKey],
    inactive: churn[inactiveKey],
  }));

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Пользователи</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Показатель</span>
        <span className={styles.statHeaderCell}>Кол-во</span>
        <span className={styles.statHeaderCell}>%</span>
        {userRows.map(({ label, value }) => (
          <span key={label} className={styles.statRowGroup}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statPercent}>{percent(value, total)}%</span>
          </span>
        ))}
      </div>

      <div className={commonStyles.cardTitle}>Активность</div>
      <div className={styles.statGrid5}>
        <span className={styles.statHeaderCell}>Период</span>
        <span className={styles.statHeaderCell}>Активные</span>
        <span className={styles.statHeaderCell}>%</span>
        <span className={styles.statHeaderCell}>Неактивные</span>
        <span className={styles.statHeaderCell}>%</span>
        {activityRows.map(({ period, active, inactive }) => (
          <span key={period} className={styles.statRowGroup}>
            <span className={styles.statLabel}>{period}</span>
            <span className={styles.statValue}>{active}</span>
            <span className={styles.statPercent}>{percent(active, total)}%</span>
            <span className={styles.statValue}>{inactive}</span>
            <span className={styles.statPercent}>{percent(inactive, total)}%</span>
          </span>
        ))}
      </div>
    </VCard>
  );
};
