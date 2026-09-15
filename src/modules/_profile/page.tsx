import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { CategorySection } from './components/CategorySection';
import { AccountsSection } from './components/AccountsSection';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <VPageHeader
        title="Профиль"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        hideOnMobile
      />

      <section aria-label="Аккаунт" className={styles.account}>
        <AccountCard />
      </section>
      <section aria-label="Счета" className={styles.accounts}>
        <AccountsSection />
      </section>
      <section aria-label="Категории операций" className={styles.categories}>
        <CategorySection />
      </section>
    </div>
  );
};
