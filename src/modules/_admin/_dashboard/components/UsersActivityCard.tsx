import type { AdminDashboardStats } from '../api/useAdminStats';
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
  const { total, onboarded } = users;

  const userRows: UserRow[] = [
    { label: 'Всего', value: total },
    { label: 'Прошли онбординг', value: onboarded },
  ];

  const activityRows: ActivityRow[] = ACTIVITY_ROWS.map(({ period, activeKey, inactiveKey }) => ({
    period,
    active: activity[activeKey],
    inactive: churn[inactiveKey],
  }));

  return (
    <VCard className={styles.card}>
      <h2 className={styles.sectionTitle}>Пользователи</h2>
      <div className={styles.tableScroll}>
        <div className={styles.statGrid}>
          <span className={styles.statHeaderCell}>Показатель</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Кол-во</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Доля</span>
          {userRows.map(({ label, value }) => {
            const pct = percent(value, total);
            return (
              <span key={label} className={styles.statRowGroup}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value.toLocaleString('ru-RU')}</span>
                <span className={styles.percentWithBar}>
                  <span>{pct}%</span>
                  <span className={styles.miniTrack}>
                    <span className={styles.miniFill} style={{ width: `${pct}%` }} />
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Активность</h2>
      <div className={styles.tableScroll}>
        <div className={styles.statGrid5}>
          <span className={styles.statHeaderCell}>Период</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Активные</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Доля</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Неактивные</span>
          <span className={`${styles.statHeaderCell} ${styles.statHeaderCellRight}`}>Доля</span>
          {activityRows.map(({ period, active, inactive }) => {
            const activePct = percent(active, total);
            const inactivePct = percent(inactive, total);
            return (
              <span key={period} className={styles.statRowGroup}>
                <span className={styles.statLabel}>{period}</span>
                <span className={styles.statValue}>{active.toLocaleString('ru-RU')}</span>
                <span className={styles.percentWithBar}>
                  <span>{activePct}%</span>
                  <span className={styles.miniTrack}>
                    <span className={styles.miniFill} style={{ width: `${activePct}%` }} />
                  </span>
                </span>
                <span className={styles.statValue}>{inactive.toLocaleString('ru-RU')}</span>
                <span className={styles.percentWithBar}>
                  <span>{inactivePct}%</span>
                  <span className={styles.miniTrack}>
                    <span className={styles.miniFillInactive} style={{ width: `${inactivePct}%` }} />
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </VCard>
  );
};
