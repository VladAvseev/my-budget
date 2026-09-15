import { VBrand } from '@/shared/ui/VBrand';
import { VCard } from '@/shared/ui/VCard';
import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

/** Статика из лендинга: та же тройка преимуществ, без новой логики. */
const PROMO_POINTS = [
  {
    title: 'Простота',
    text: 'Понятный интерфейс: начать вести бюджет можно сразу после регистрации.',
  },
  {
    title: 'Гибкость в настройке периодов',
    text: 'Настраивайте периоды под себя: выбирайте нужные периоды, категории и показатели.',
  },
  {
    title: 'Работа в браузере без установки',
    text: 'Ничего не нужно скачивать и обновлять — доступ с любого устройства.',
  },
];

/**
 * Общий каркас экранов входа и регистрации. Compact — одна центрированная
 * колонка; на expanded и шире — сплит: слева форма, справа декоративная
 * панель. Сплит собран чистым CSS (без условного рендера по брейкпоинту),
 * поэтому ввод, фокус и `isPending` при ресайзе не теряются. Панель
 * декоративна: только статика, никакого интерактива и логики.
 */
export const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <main className={styles.formPane}>
          <VBrand to="/" className={styles.brand} />
          <VCard className={styles.formCard}>
            <h1 className={styles.title}>{title}</h1>
            {children}
          </VCard>
        </main>

        <aside className={styles.promoPane} aria-label="О приложении «Мои финансы»">
          <div className={styles.promoCard}>
            <h2 className={styles.promoTitle}>Деньги — под контролем</h2>
            <p className={styles.promoText}>
              Фиксируйте доходы и расходы, копите на цели и понимайте, куда уходит каждая
              трата.
            </p>

            <ul className={styles.promoList}>
              {PROMO_POINTS.map((point) => (
                <li key={point.title} className={styles.promoItem}>
                  <span className={styles.promoItemTitle}>{point.title}</span>
                  <span className={styles.promoItemText}>{point.text}</span>
                </li>
              ))}
            </ul>

            <div className={styles.demoCard}>
              <dl className={styles.demoRows}>
                <div className={styles.demoRow}>
                  <dt className={styles.demoLabel}>Баланс</dt>
                  <dd className={styles.demoValue}>84 250 ₽</dd>
                </div>
                <div className={styles.demoRow}>
                  <dt className={styles.demoLabel}>Доходы за месяц</dt>
                  <dd className={styles.demoValue}>+96 400 ₽</dd>
                </div>
                <div className={styles.demoRow}>
                  <dt className={styles.demoLabel}>Расходы за месяц</dt>
                  <dd className={styles.demoValue}>−61 300 ₽</dd>
                </div>
              </dl>
              <div
                className={styles.demoProgressTrack}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={68}
                aria-label="Накопления на отпуск: 68% от цели"
              >
                <div className={styles.demoProgressFill} />
              </div>
              <span className={styles.demoCaption}>Накопления на отпуск · 68% от цели</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
