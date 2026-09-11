import { useBootstrap } from '@/shared/api/hooks';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { getErrorMessage } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './homeCard.module.css';
import { AccumulationsCard } from './components/AccumulationsCard';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  // Один bootstrap на всю страницу: при ошибке карточки не рендерятся —
  // вместо них баннер с повтором.
  const { error, refetch, isFetching } = useBootstrap();

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Главная" hideOnMobile />
      <div className={commonStyles.cardList}>
        {error ? (
          <VCard className={`${styles.cardGrow} ${styles.animateCard}`}>
            <div className={styles.emptyMessage}>Не удалось загрузить данные главной</div>
            <div className={styles.subtitle}>{getErrorMessage(error)}</div>
            <VButton onClick={() => void refetch()} isLoading={isFetching}>
              Повторить
            </VButton>
          </VCard>
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
