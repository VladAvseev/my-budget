import { BanknotesIcon, CapitalIcon, MenuIcon, OverviewIcon } from '@/shared/icons';
import { LegalLinks } from '@/shared/legal/LegalLinks';
import { VBrand } from '@/shared/ui/VBrand';
import { VButton } from '@/shared/ui/VButton';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './landing.module.css';

const FEATURES = [
  {
    icon: BanknotesIcon,
    title: 'Учёт доходов и расходов',
    text: 'Фиксируйте операции в пару кликов и всегда знайте, куда уходят деньги.',
  },
  {
    icon: CapitalIcon,
    title: 'Накопления',
    text: 'Ставьте финансовые цели и откладывайте деньги: прогресс всегда перед глазами.',
  },
  {
    icon: MenuIcon,
    title: 'Категории операций',
    text: 'Организуйте траты по категориям, чтобы легко анализировать структуру расходов.',
  },
  {
    icon: OverviewIcon,
    title: 'Аналитика бюджета',
    text: 'Наглядная сводка баланса и ключевых показателей бюджета в одном месте.',
  },
];

const ADVANTAGES = [
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

export const Page: React.FC = () => {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <VBrand to="/" />
          <nav className={styles.headerActions} aria-label="Вход и регистрация">
            <Link to="/login">
              <VButton variant="secondary">Войти</VButton>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <span className={styles.heroBadge}>Личный бюджет онлайн</span>
              <h1 className={styles.heroTitle}>Управляйте деньгами без лишних усилий</h1>
              <p className={styles.heroText}>
                «Мои финансы» помогает фиксировать доходы и расходы, копить на цели и понимать, куда
                уходит каждая трата.
              </p>
              <div className={styles.heroButtons}>
                <Link to="/registration">
                  <VButton>Начать вести бюджет</VButton>
                </Link>
                <Link to="/login">
                  <VButton variant="secondary">У меня есть аккаунт</VButton>
                </Link>
              </div>
              <span className={styles.heroNote}>
                Бесплатно, без установки, работает в любом браузере
              </span>
            </div>

            <div className={styles.demoCard}>
              <dl className={styles.demoRows}>
                <div className={styles.demoRow}>
                  <dt className={styles.demoLabel}>Баланс</dt>
                  <dd className={`${styles.demoValue} ${styles.demoValueBalance}`}>84 250 ₽</dd>
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
              <div className={styles.demoProgress}>
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
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Возможности приложения</h2>
              <p className={styles.sectionText}>
                Всё необходимое для учёта личных финансов — в одном месте.
              </p>
            </div>
            <ul className={styles.featuresList}>
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className={styles.featureItem}>
                    <span className={styles.featureIcon}>
                      <Icon size={24} color="currentColor" />
                    </span>
                    <div className={styles.featureBody}>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureText}>{feature.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Почему «Мои финансы»?</h2>
              <p className={styles.sectionText}>
                Приложение создано для тех, кто хочет простого и гибкого учёта финансов.
              </p>
            </div>
            <ul className={styles.advantagesList}>
              {ADVANTAGES.map((advantage) => (
                <li key={advantage.title} className={styles.advantageItem}>
                  <h3 className={styles.advantageTitle}>{advantage.title}</h3>
                  <p className={styles.advantageText}>{advantage.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.ctaPanel}>
              <h2 className={styles.ctaTitle}>Готовы навести порядок в финансах?</h2>
              <p className={styles.ctaText}>
                Создайте аккаунт и начните вести бюджет уже сегодня — это займёт меньше минуты.
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/registration">
                  <VButton>Создать аккаунт</VButton>
                </Link>
                <Link to="/login">
                  <VButton variant="secondary">Войти</VButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} «Мои финансы»</span>
          <LegalLinks className={styles.footerNav} itemClassName={styles.footerLink} />
        </div>
      </footer>
    </div>
  );
};
