import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import styles from './cards.module.css';

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

interface ReportsOperationsCardProps {
  reports: AdminDashboardStats['reports'];
  operations: AdminDashboardStats['operations'];
}

export const ReportsOperationsCard: React.FC<ReportsOperationsCardProps> = ({
  reports,
  operations,
}) => {
  const { total: reportsTotal, withDailyExpenses } = reports;
  const { total: operationsTotal, income, expense, daily, savings } = operations;

  return (
    <VCard className={styles.card}>
      <div className={commonStyles.cardTitle}>Отчёты и операции</div>
      <div className={styles.statGrid}>
        <span className={styles.statHeaderCell}>Показатель</span>
        <span className={styles.statHeaderCell}>Кол-во</span>
        <span className={styles.statHeaderCell}>%</span>

        <span className={styles.statSubheader}>Отчёты</span>
        <span className={styles.statLabel}>Всего</span>
        <span className={styles.statValue}>{reportsTotal}</span>
        <span className={styles.statPercent}>{percent(reportsTotal, reportsTotal)}%</span>
        <span className={styles.statLabel}>С еж. расходами</span>
        <span className={styles.statValue}>{withDailyExpenses}</span>
        <span className={styles.statPercent}>{percent(withDailyExpenses, reportsTotal)}%</span>

        <span className={styles.statSubheader}>Операции</span>
        <span className={styles.statLabel}>Всего</span>
        <span className={styles.statValue}>{operationsTotal}</span>
        <span className={styles.statPercent}>{percent(operationsTotal, operationsTotal)}%</span>
        <span className={styles.statLabel}>Доходы</span>
        <span className={styles.statValue}>{income}</span>
        <span className={styles.statPercent}>{percent(income, operationsTotal)}%</span>
        <span className={styles.statLabel}>Расходы</span>
        <span className={styles.statValue}>{expense}</span>
        <span className={styles.statPercent}>{percent(expense, operationsTotal)}%</span>
        <span className={styles.statLabel}>Ежедневные</span>
        <span className={styles.statValue}>{daily}</span>
        <span className={styles.statPercent}>{percent(daily, operationsTotal)}%</span>
        <span className={styles.statLabel}>Накопления</span>
        <span className={styles.statValue}>{savings}</span>
        <span className={styles.statPercent}>{percent(savings, operationsTotal)}%</span>
      </div>
    </VCard>
  );
};
