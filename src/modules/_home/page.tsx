import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import { AccumulationsCard } from './components/AccumulationsCard';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { NewsCard } from './components/NewsCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Главная" hideOnMobile />
      <div className={commonStyles.cardList}>
        <NewsCard />
        <OnboardingCard />
        <NewReportCard />
        <LastReportCard />
        <OverviewCard />
        <AccumulationsCard />
      </div>
    </div>
  );
};
