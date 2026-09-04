import { BanknotesIcon, MenuIcon, OverviewIcon, SavingsIcon } from '@/shared/icons';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
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
    icon: SavingsIcon,
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
    title: 'Обзор бюджета',
    text: 'Наглядная сводка баланса и ключевых показателей бюджета в одном месте.',
  },
];

const ADVANTAGES = [
  {
    number: '01',
    title: 'Простота',
    text: 'Понятный интерфейс: начать вести бюджет можно сразу после регистрации.',
  },
  {
    number: '02',
    title: 'Гибкость в настройке периодов',
    text: 'Настраивайте периоды под себя: выбирайте нужные периоды, категории и показатели.',
  },
  {
    number: '03',
    title: 'Работа в браузере без установки',
    text: 'Ничего не нужно скачивать и обновлять — доступ с любого устройства.',
  },
];

export const Page: React.FC = () => {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link to="/" className={styles.logo}>
            <BanknotesIcon size={24} color="currentColor" />
            <span className={styles.logoName}>Мой бюджет</span>
          </Link>
          <nav className={styles.headerActions}>
            <Link to="/login">
              <VButton variant="secondary">Войти</VButton>
            </Link>
            <Link to="/registration">
              <VButton>Регистрация</VButton>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <span className={`${styles.heroBadge} ${styles.animate}`}>Личный бюджет онлайн</span>
              <h1
                className={`${styles.heroTitle} ${styles.animate}`}
                style={{ animationDelay: '0.08s' }}
              >
                Управляйте деньгами{' '}
                <span className={styles.heroTitleAccent}>без лишних усилий</span>
              </h1>
              <p
                className={`${styles.heroText} ${styles.animate}`}
                style={{ animationDelay: '0.16s' }}
              >
                «Мой бюджет» помогает фиксировать доходы и расходы, копить на цели и понимать, куда
                уходит каждая трата.
              </p>
              <div
                className={`${styles.heroButtons} ${styles.animate}`}
                style={{ animationDelay: '0.24s' }}
              >
                <Link to="/registration">
                  <VButton>Начать вести бюджет</VButton>
                </Link>
                <Link to="/login">
                  <VButton variant="secondary">У меня есть аккаунт</VButton>
                </Link>
              </div>
              <span
                className={`${styles.heroNote} ${styles.animate}`}
                style={{ animationDelay: '0.32s' }}
              >
                Бесплатно · Без установки · Работает в любом браузере
              </span>
            </div>

            <VCard
              className={`${styles.demoCard} ${styles.animate}`}
              style={{ animationDelay: '0.2s' }}
            >
              <div className={styles.demoRow}>
                <span className={styles.demoLabel}>Баланс</span>
                <span className={styles.demoValue}>84 250 ₽</span>
              </div>
              <div className={styles.demoRow}>
                <span className={styles.demoLabel}>Доходы за месяц</span>
                <span className={`${styles.demoValue} ${styles.demoValueIncome}`}>+96 400 ₽</span>
              </div>
              <div className={styles.demoRow}>
                <span className={styles.demoLabel}>Расходы за месяц</span>
                <span className={`${styles.demoValue} ${styles.demoValueExpense}`}>−61 300 ₽</span>
              </div>
              <div className={styles.demoProgress}>
                <div className={styles.demoProgressTrack}>
                  <div className={styles.demoProgressFill} />
                </div>
                <span className={styles.demoCaption}>Накопления на отпуск · 68% от цели</span>
              </div>
            </VCard>
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
            <div className={styles.featuresGrid}>
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <VCard
                    key={feature.title}
                    className={`${styles.featureCard} ${styles.animate}`}
                    style={{ animationDelay: `${0.08 * index}s` }}
                  >
                    <span className={styles.featureIcon}>
                      <Icon size={24} color="currentColor" />
                    </span>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.text}</p>
                  </VCard>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Почему «Мой бюджет»?</h2>
              <p className={styles.sectionText}>
                Приложение создано для тех, кто хочет простого и гибкого учёта финансов.
              </p>
            </div>
            <div className={styles.advantagesGrid}>
              {ADVANTAGES.map((advantage, index) => (
                <div
                  key={advantage.number}
                  className={`${styles.advantageItem} ${styles.animate}`}
                  style={{ animationDelay: `${0.08 * index}s` }}
                >
                  <span className={styles.advantageNumber}>{advantage.number}</span>
                  <h3 className={styles.advantageTitle}>{advantage.title}</h3>
                  <p className={styles.advantageText}>{advantage.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={`${styles.ctaPanel} ${styles.animate}`}>
              <h2 className={styles.sectionTitle}>Готовы навести порядок в финансах?</h2>
              <p className={styles.sectionText}>
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
          <span className={styles.footerCopy}>© {new Date().getFullYear()} «Мой бюджет»</span>
        </div>
      </footer>
    </div>
  );
};
