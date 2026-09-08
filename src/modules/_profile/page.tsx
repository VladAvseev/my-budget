import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { CategorySection } from './components/CategorySection';
import { StartBalanceCard } from './components/StartBalanceCard';
import { ThemeCard } from './components/ThemeCard';

const AnimatedItem = ({ delay, children }: { delay: string; children: ReactNode }) => (
  <div className={commonStyles.animateCard} style={{ animationDelay: delay }}>
    {children}
  </div>
);

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Профиль"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        hideOnMobile
      />

      <AnimatedItem delay="0s">
        <AccountCard />
      </AnimatedItem>
      <AnimatedItem delay="0.06s">
        <StartBalanceCard />
      </AnimatedItem>
      <AnimatedItem delay="0.12s">
        <ThemeCard />
      </AnimatedItem>
      <AnimatedItem delay="0.18s">
        <CategorySection />
      </AnimatedItem>
    </div>
  );
};
