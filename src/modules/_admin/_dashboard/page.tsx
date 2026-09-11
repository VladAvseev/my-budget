import commonStyles from '@/shared/styles/common.module.css';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { useAdminStats } from './api/useAdminStats';
import { OperationsDynamicsCard } from './components/OperationsDynamicsCard';
import { ReportsOperationsCard } from './components/ReportsOperationsCard';
import { StorageCard } from './components/StorageCard';
import { UsersActivityCard } from './components/UsersActivityCard';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const statsQuery = useAdminStats();

  if (statsQuery.isLoading) {
    return (
      <div className={commonStyles.page}>
        <div className={styles.grid}>
          <VSkeletonCard compact className={styles.fullWidth} lines={4} />
          <VSkeletonCard compact lines={3} delay="0.05s" />
          <VSkeletonCard compact lines={3} delay="0.1s" />
          <VSkeletonCard compact className={styles.fullWidth} lines={2} delay="0.15s" />
        </div>
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <div className={commonStyles.page}>
        <VErrorCard
          title="Не удалось загрузить статистику"
          error={statsQuery.error}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
        />
      </div>
    );
  }

  const { users, activity, churn, reports, operations } = statsQuery.data;

  return (
    <div className={commonStyles.page}>
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
        <div
          className={`${commonStyles.animateCard} ${styles.fullWidth}`}
          style={{ animationDelay: '0.09s' }}
        >
          <StorageCard />
        </div>
      </div>
    </div>
  );
};
