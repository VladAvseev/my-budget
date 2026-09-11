import { useBootstrap } from '@/shared/api/hooks';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './homeCard.module.css';
import { AccumulationsCard } from './components/AccumulationsCard';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  // Один bootstrap на всю страницу: при ошибке карточки не рендерятся —
  // вместо них карточка с повтором.
  const { error, refetch, isFetching } = useBootstrap();

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Главная" hideOnMobile />
      <div className={commonStyles.cardList}>
        {error ? (
          <VErrorCard
            className={`${styles.cardGrow} ${styles.animateCard}`}
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
            <AccumulationsCard />
          </>
        )}
      </div>
    </div>
  );
};
