import { useBootstrap } from '@/shared/api/hooks';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import styles from './homeCard.module.css';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {

  const { error, refetch, isFetching } = useBootstrap();

  return (
    <div className={styles.page}>
      <div className={styles.cardList}>
        {error ? (
          <VErrorCard
            className={`${styles.errorCard} ${styles.pageError}`}
            title="Не удалось загрузить данные главной"
            error={error}
            onRetry={refetch}
            isRetrying={isFetching}
          />
        ) : (
          <>
            <OnboardingCard />
            <NewReportCard />
            <LastReportCard />
            <OverviewCard />
          </>
        )}
      </div>
    </div>
  );
};
