import { AccountCard } from './components/AccountCard';
import { CategorySection } from './components/CategorySection';
import { AccountsSection } from './components/AccountsSection';
import styles from './page.module.css';

export const Page: React.FC = () => {
  return (
    <div className={styles.page}>
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
