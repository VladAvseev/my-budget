import commonStyles from '@/shared/styles/common.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminStats } from './api/useAdminStats';
import { OperationsDynamicsCard } from './components/OperationsDynamicsCard';
import { ReportsOperationsCard } from './components/ReportsOperationsCard';
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
  const queryClient = useQueryClient();

  const { users, activity, churn, reports, operations } = statsQuery.data ?? {};

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
      <div className={commonStyles.pageHeaderRow}>
        <VButton
          variant="secondary"
          isLoading={statsQuery.isFetching}
          onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin'] })}
        >
          Обновить
        </VButton>
      </div>

      <div className={styles.grid}>
        <div className={`${commonStyles.animateCard} ${styles.fullWidth}`}>
          <OperationsDynamicsCard />
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.03s' }}>
          {statsQuery.isLoading ? (
            <VSkeletonCard compact lines={3} />
          ) : statsQuery.isError || !reports || !operations ? (
            statsError
          ) : (
            <ReportsOperationsCard reports={reports} operations={operations} />
          )}
        </div>
        <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
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
