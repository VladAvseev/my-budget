import { useBootstrap } from '@/shared/api/hooks';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import styles from './homeCard.module.css';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  // Один bootstrap на всю страницу: при ошибке карточки не рендерятся —
  // вместо них карточка с повтором.
  const { error, refetch, isFetching } = useBootstrap();

  return (
    <div className={styles.page}>
      <VPageHeader title="Главная" hideOnMobile className={styles.pageHeader} />
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
