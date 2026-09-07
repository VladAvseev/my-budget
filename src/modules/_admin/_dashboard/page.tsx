import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAdminStats } from './api/useAdminStats';
import { DatabaseSizeCard } from './components/DatabaseSizeCard';
import { OperationsDynamicsCard } from './components/OperationsDynamicsCard';
import { ReportsOperationsCard } from './components/ReportsOperationsCard';
import { UsersActivityCard } from './components/UsersActivityCard';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const statsQuery = useAdminStats();

  if (statsQuery.isLoading) {
    return (
      <div className={commonStyles.loaderContainer}>
        <VLoader size={28} />
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <div className={commonStyles.page}>
        <VPageHeader title="Дашборд" />
        <div className={commonStyles.textSecondary}>Не удалось загрузить статистику</div>
      </div>
    );
  }

  const { users, activity, churn, reports, operations } = statsQuery.data;

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Дашборд" />
      <div className={styles.grid}>
        <div className={`${commonStyles.animateCard} ${styles.fullWidth}`}>
          <OperationsDynamicsCard />
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.03s' }}>
          <ReportsOperationsCard reports={reports} operations={operations} />
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
          <UsersActivityCard users={users} activity={activity} churn={churn} />
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.09s' }}>
          <DatabaseSizeCard />
        </div>
      </div>
    </div>
  );
};
