import { LogoutIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useThemeStyles } from '@/shared/theme';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { CategoryList } from './components/CategoryList';
import { StartBalanceCard } from './components/StartBalanceCard';
import { ThemeCard } from './components/ThemeCard';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
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
            color={styles.colors.error}
          >
            <LogoutIcon size={24} color={styles.colors.error} />
          </VIconButton>
        }
      />
      <AccountCard />
      <ThemeCard />
      <StartBalanceCard />
      <CategoryList type="expense" title="Категории расходов" />
      <CategoryList type="income" title="Категории доходов" />
      <CategoryList type="savings" title="Категории накоплений" />
    </div>
  );
};
