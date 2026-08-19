import { LogoutIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { CategoryList } from './components/CategoryList';
import { StartBalanceCard } from './components/StartBalanceCard';
import { SupportCard } from './components/SupportCard';
import { ThemeCard } from './components/ThemeCard';

const AnimatedItem = ({ delay, children }: { delay: string; children: ReactNode }) => (
  <div className={commonStyles.animateCard} style={{ animationDelay: delay }}>
    {children}
  </div>
);

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Профиль"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        right={
          <VIconButton
            ariaLabel="Выйти из аккаунта"
            onClick={() => setIsLogoutConfirmOpen(true)}
            isDisabled={isSigningOut}
            color="var(--color-error)"
          >
            <LogoutIcon size={24} color="currentColor" />
          </VIconButton>
        }
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
        <SupportCard />
      </AnimatedItem>

      <AnimatedItem delay="0.24s">
        <CategoryList type="expense" title="Категории расходов" />
      </AnimatedItem>
      <AnimatedItem delay="0.3s">
        <CategoryList type="income" title="Категории доходов" />
      </AnimatedItem>
      <AnimatedItem delay="0.36s">
        <CategoryList type="savings" title="Категории накоплений" />
      </AnimatedItem>

      <VConfirmModal
        visible={isLogoutConfirmOpen}
        title="Выйти из аккаунта"
        message="Вы действительно хотите выйти из аккаунта?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
};