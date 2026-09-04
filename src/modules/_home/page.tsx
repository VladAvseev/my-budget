import { UserIcon } from '@/shared/icons';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import { useNavigate } from 'react-router-dom';
import { AccumulationsCard } from './components/AccumulationsCard';
import { LastReportCard } from './components/LastReportCard';
import { NewReportCard } from './components/NewReportCard';
import { NewsCard } from './components/NewsCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Главная"
        right={
          <VIconButton
            ariaLabel="Профиль"
            onClick={() => navigate('/profile')}
            color="var(--color-text-primary)"
          >
            <UserIcon size={24} color="currentColor" />
          </VIconButton>
        }
      />
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