import { UserIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useNavigate } from 'react-router-dom';
import { AccumulationsCard } from './components/AccumulationsCard';
import { LastReportCard } from './components/LastReportCard';
import { NewsCard } from './components/NewsCard';
import { OnboardingCard } from './components/OnboardingCard';
import { OverviewCard } from './components/OverviewCard';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
      <VPageHeader
        title="Главная"
        right={
          <VIconButton
            ariaLabel="Профиль"
            onClick={() => navigate('/profile')}
            color={styles.colors.textPrimary}
          >
            <UserIcon size={24} color={styles.colors.textPrimary} />
          </VIconButton>
        }
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: styles.spacing.l,
          width: '100%',
        }}
      >
        <NewsCard />
        <OnboardingCard />
        <OverviewCard />
        <LastReportCard />
        <AccumulationsCard />
      </div>
    </div>
  );
};
