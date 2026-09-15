import { useAdminStatus } from '@/shared/api/hooks';
import { useAuth } from '@/shared/api/authProvider';
import {
  ChevronRightIcon,
  HomeIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
  SettingsIcon,
  UserIcon,
  type IconProps,
} from '@/shared/icons';
import { VBrand } from '@/shared/ui/VBrand';
import { AccountsBalanceBadge } from '@/shared/layout/AccountsBalanceBadge';
import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Главная', icon: HomeIcon, end: true },
  { to: '/reports', label: 'Периоды', icon: ReportsIcon },
  { to: '/capital', label: 'Капитал', icon: SavingsIcon },
  { to: '/overview', label: 'Аналитика', icon: OverviewIcon },
];

// Ширина, на которой нижняя навигация сменяется ссылками в шапке.
// Совпадает с min-width: 840px в AppLayout.module.css.
const TOP_NAV_QUERY = '(min-width: 840px)';

const ProfileLink = () => {
  const { user } = useAuth();

  const login = user?.login ?? '';
  const initial = login ? login[0].toUpperCase() : '?';
  const name = login || 'Профиль';

  return (
    <NavLink to="/profile" className={styles.profileLink}>
      <div className={styles.profileAvatar} aria-hidden="true">
        {initial}
      </div>
      <span className={styles.profileName}>{name}</span>
      <span className={styles.profileChevron} aria-hidden="true">
        <ChevronRightIcon size={14} />
      </span>
    </NavLink>
  );
};

const MobileProfileLink = () => (
  <NavLink
    to="/profile"
    aria-label="Профиль"
    className={styles.mobileProfileLink}
  >
    <UserIcon size={22} />
  </NavLink>
);

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAdmin } = useAdminStatus();
  const location = useLocation();
  const topNavRef = useRef<HTMLElement>(null);
  const bottomNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Обе навигации смонтированы всегда, видима одна (переключение чистым CSS).
  // Если фокус был в навигации, скрытой ресайзом, переносим его на ту же
  // ссылку в ставшей видимой навигации, чтобы не ронять фокус в body.
  useEffect(() => {
    const query = window.matchMedia(TOP_NAV_QUERY);
    const transferFocus = () => {
      const active = document.activeElement as HTMLElement | null;
      const to = active?.dataset?.navTo;
      if (!to) return;
      const visible = query.matches ? topNavRef.current : bottomNavRef.current;
      if (!visible || visible.contains(active)) return;
      visible.querySelector<HTMLElement>(`[data-nav-to="${to}"]`)?.focus({ preventScroll: true });
    };
    query.addEventListener('change', transferFocus);
    return () => query.removeEventListener('change', transferFocus);
  }, []);

  return (
    <div className={styles.root}>
      <a href="#main-content" className={styles.skipLink}>
        К содержимому
      </a>

      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <VBrand className={styles.brand} />

          <nav ref={topNavRef} className={styles.topNav} aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-nav-to={item.to}
                className={styles.navLink}
              >
                <span className={styles.navLinkContent}>
                  <item.icon size={18} />
                  {item.label}
                </span>
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <div className={styles.adminDivider} aria-hidden="true" />
                <NavLink to="/admin" data-nav-to="/admin" className={styles.navLink}>
                  <span className={styles.navLinkContent}>
                    <SettingsIcon size={18} />
                    Админ-панель
                  </span>
                </NavLink>
              </>
            )}
          </nav>

          <div className={styles.actions}>
            <AccountsBalanceBadge />
            <ProfileLink />
            <MobileProfileLink />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className={styles.main}>
        {children}
      </main>

      <nav ref={bottomNavRef} className={styles.bottomNav} aria-label="Основная навигация">
        <div className={styles.bottomNavList}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-nav-to={item.to}
              className={styles.bottomNavItem}
            >
              <span className={styles.pill} aria-hidden="true">
                <item.icon size={22} />
              </span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin" data-nav-to="/admin" className={styles.bottomNavItem}>
              <span className={styles.pill} aria-hidden="true">
                <SettingsIcon size={22} />
              </span>
              <span className={styles.bottomNavLabel}>Админ</span>
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
};
