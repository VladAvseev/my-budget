import { AccountCard } from './components/AccountCard';
import { AccountsSection } from './components/AccountsSection';
import { CategorySection } from './components/CategorySection';
import { DangerZone } from './components/DangerZone';
import { LegalCard } from './components/LegalCard';
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

      <section aria-label="Правовые документы" className={styles.legal}>
        <LegalCard />
      </section>

      <section aria-label="Опасная зона" className={styles.danger}>
        <DangerZone />
      </section>
    </div>
  );
};
