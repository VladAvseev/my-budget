import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { ActivityCard } from './components/ActivityCard';
import { ChurnCard } from './components/ChurnCard';
import { DatabaseSizeCard } from './components/DatabaseSizeCard';
import { ReportsOperationsCard } from './components/ReportsOperationsCard';
import { SupportStatusCard } from './components/SupportStatusCard';
import { UsersCard } from './components/UsersCard';
import { useAdminStats } from './api/useAdminStats';
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
  const usersTotal = users.total;

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Дашборд" />
      <div className={styles.grid}>
        <DatabaseSizeCard />
        <UsersCard stats={users} />
        <ActivityCard stats={activity} total={usersTotal} />
        <ChurnCard stats={churn} total={usersTotal} />
        <ReportsOperationsCard reports={reports} operations={operations} />
        <SupportStatusCard />
      </div>
    </div>
  );
};
