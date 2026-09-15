import { useBreakpoint } from '@/shared/hooks';
import { useAdminStatus } from '@/shared/api/hooks';
import {
  BanknotesIcon,
  ChevronRightIcon,
  HomeIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
  SettingsIcon,
  UserIcon,
  type IconProps,
} from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';
import { AccountsBalanceBadge } from '@/shared/layout/AccountsBalanceBadge';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
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

const ProfileLink = () => {
  const { user } = useAuth();

  const login = user?.login ?? '';
  const initial = login ? login[0].toUpperCase() : '?';
  const name = login || 'Профиль';

  return (
    <NavLink to="/profile" className={styles.profileLink}>
      <div className={styles.profileAvatar}>{initial}</div>
      <span className={styles.profileName}>{name}</span>
      <span className={styles.profileChevron}>
        <ChevronRightIcon size={14} />
      </span>
    </NavLink>
  );
};

const DesktopHeader = () => {
  const { isAdmin } = useAdminStatus();

  return (
    <header className={styles.desktopHeader}>
      <div className={styles.desktopHeaderInner}>
        <div className={styles.brand}>
          <BanknotesIcon size={24} />
          <span className={styles.brandTitle}>Мои финансы</span>
        </div>

        <nav className={styles.desktopNav} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={styles.navLink}>
              <span className={styles.navLinkContent}>
                <item.icon size={18} />
                {item.label}
              </span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className={styles.adminDivider} aria-hidden="true" />
              <NavLink to="/admin" className={styles.navLink}>
                <span className={styles.navLinkContent}>
                  <SettingsIcon size={18} />
                  Админ-панель
                </span>
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.desktopActions}>
          <AccountsBalanceBadge />
          <ProfileLink />
        </div>
      </div>
    </header>
  );
};

const MobileProfileLink = () => (
  <NavLink to="/profile" aria-label="Профиль" className={styles.mobileProfileLink}>
    <UserIcon size={22} />
  </NavLink>
);

interface EdgeOverflow {
  first: boolean;
  last: boolean;
}

const MobileFooter = () => {
  const { isAdmin } = useAdminStatus();
  const navRef = useRef<HTMLDivElement>(null);
  const firstLabelRef = useRef<HTMLSpanElement>(null);
  const lastLabelRef = useRef<HTMLSpanElement>(null);
  const [edgeOverflow, setEdgeOverflow] = useState<EdgeOverflow>({ first: false, last: false });

  useLayoutEffect(() => {
    const measure = () => {
      const checkOverflow = (label: HTMLSpanElement | null) =>
        Boolean(label?.parentElement && label.scrollWidth > label.parentElement.clientWidth);

      setEdgeOverflow((prev) => {
        const next = {
          first: checkOverflow(firstLabelRef.current),
          last: checkOverflow(lastLabelRef.current),
        };
        return prev.first === next.first && prev.last === next.last ? prev : next;
      });
    };

    measure();

    const nav = navRef.current;
    const observer = new ResizeObserver(measure);
    if (nav) {
      observer.observe(nav);
    }
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isAdmin]);

  const lastRegularIndex = NAV_ITEMS.length - 1;

  const getLabelClassName = (isFirst: boolean, isLast: boolean) => {
    if (isFirst && edgeOverflow.first) {
      return `${styles.mobileNavLabel} ${styles.mobileNavLabelStart}`;
    }
    if (isLast && edgeOverflow.last) {
      return `${styles.mobileNavLabel} ${styles.mobileNavLabelEnd}`;
    }
    return styles.mobileNavLabel;
  };

  return (
    <nav className={styles.mobileFooter}>
      <div className={styles.mobileNav} ref={navRef}>
        {NAV_ITEMS.map((item, index) => {
          const isFirst = index === 0;
          const isLast = !isAdmin && index === lastRegularIndex;

          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={styles.mobileNavItem}>
              <span className={styles.mobileNavIcon}>
                <item.icon size={22} />
              </span>
              <span
                ref={isFirst ? firstLabelRef : isLast ? lastLabelRef : undefined}
                className={getLabelClassName(isFirst, isLast)}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink to="/admin" className={styles.mobileNavItem}>
            <span className={styles.mobileNavIcon}>
              <SettingsIcon size={22} />
            </span>
            <span ref={lastLabelRef} className={getLabelClassName(false, true)}>
              Админ
            </span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isDesktop } = useBreakpoint();
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (isDesktop) {
      mainRef.current?.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isDesktop]);

  if (isDesktop) {
    return (
      <div className={styles.desktopRoot}>
        <DesktopHeader />

        <main ref={mainRef} className={styles.mainDesktop}>
          <div className={styles.desktopContent}>{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.mobileRoot}>
      <header className={styles.mobileHeader}>
        <div className={styles.mobileStats}>
          <AccountsBalanceBadge />
        </div>
        <MobileProfileLink />
      </header>

      <main ref={mainRef} className={styles.mainMobile}>
        {children}
      </main>

      <MobileFooter />
    </div>
  );
};
