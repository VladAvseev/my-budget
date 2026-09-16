import commonStyles from '@/shared/styles/common.module.css';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { useAdminStats } from './api/useAdminStats';
import { OperationsDynamicsCard } from './components/OperationsDynamicsCard';
import { StorageCard } from './components/StorageCard';
import { UsersActivityCard } from './components/UsersActivityCard';
import styles from './page.module.css';

/**
 * Дашборд грузится параллельно: карточки динамики операций и хранилища делают
 * свои запросы сами, карточки на useAdminStats показывают скелетон/ошибку
 * независимо — сбой сводки не гасит весь экран.
 */
export const Page: React.FC = () => {
  const statsQuery = useAdminStats();

  const { users, activity, churn } = statsQuery.data ?? {};

  const statsError = (
    <VErrorCard
      title="Не удалось загрузить статистику"
      error={statsQuery.error}
      onRetry={() => void statsQuery.refetch()}
      isRetrying={statsQuery.isFetching}
    />
  );

  return (
    <div className={commonStyles.page}>
      <div className={styles.grid}>
        <div className={`${commonStyles.animateCard} ${styles.fullWidth}`}>
          <OperationsDynamicsCard />
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.03s' }}>
          {statsQuery.isLoading ? (
            <VSkeletonCard compact lines={3} delay="0.05s" />
          ) : statsQuery.isError || !users || !activity || !churn ? (
            statsError
          ) : (
            <UsersActivityCard users={users} activity={activity} churn={churn} />
          )}
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
