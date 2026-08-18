import { LogoutIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { CategoryList } from './components/CategoryList';
import { StartBalanceCard } from './components/StartBalanceCard';
import { SupportCard } from './components/SupportCard';
import { ThemeCard } from './components/ThemeCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
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
            onClick={handleSignOut}
            isDisabled={isSigningOut}
            isLoading={isSigningOut}
            color="var(--color-error)"
          >
            <LogoutIcon size={24} color="currentColor" />
          </VIconButton>
        }
      />
      <AccountCard />
      <ThemeCard />
      <StartBalanceCard />
      <SupportCard />
      <CategoryList type="expense" title="Категории расходов" />
      <CategoryList type="income" title="Категории доходов" />
      <CategoryList type="savings" title="Категории накоплений" />
    </div>
  );
};