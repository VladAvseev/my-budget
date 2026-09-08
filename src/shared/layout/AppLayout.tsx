import { useAdminSupportOpenCount } from '@/modules/_admin/_support/api/useAdminSupportOpenCount';
import { useSupportUnread } from '@/modules/_support/api/useSupportUnread';
import {
  useAdminStatus,
  useBreakpoint,
  useCapital,
  useCurrency,
  useGlobalBalance,
} from '@/shared/hooks';
import {
  BanknotesIcon,
  ChevronRightIcon,
  HomeIcon,
  MessageIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
  SettingsIcon,
  UserIcon,
  type IconProps,
} from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
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
  { to: '/overview', label: 'Аналитика', icon: OverviewIcon },
  { to: '/reports', label: 'Периоды', icon: ReportsIcon },
  { to: '/accumulations', label: 'Накопления', icon: SavingsIcon },
  { to: '/support', label: 'Помощь', icon: MessageIcon },
];

const SupportUnreadBadge = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  const unreadQuery = useSupportUnread(user?.id ?? '');
  const unread = unreadQuery.data ?? 0;

  if (unread <= 0) {
    return null;
  }

  return (
    <VBadge variant="accent" className={className}>
      {unread}
    </VBadge>
  );
};

const AdminOpenBadge = ({ className }: { className?: string }) => {
  const { isAdmin } = useAdminStatus();
  const openQuery = useAdminSupportOpenCount(isAdmin);
  const openCount = openQuery.data ?? 0;

  if (!isAdmin || openCount <= 0) {
    return null;
  }

  return (
    <VBadge variant="warning" className={className}>
      {openCount}
    </VBadge>
  );
};

const ProfileLink = () => {
  const { user } = useAuth();

  const email = user?.email ?? '';
  const initial = email ? email[0].toUpperCase() : '?';
  const name = email ? email.split('@')[0] : 'Профиль';

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

const SidebarContent = () => {
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { isAdmin } = useAdminStatus();
  const currency = useCurrency();

  const showCapital =
    formatAmount(capital, currency?.symbol) !== formatAmount(balance, currency?.symbol);

  return (
    <>
      <div className={styles.brand}>
        <BanknotesIcon size={24} />
        <span className={styles.brandTitle}>Мой бюджет</span>
      </div>

      <div className={styles.stats}>
        {showCapital && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Капитал</span>
            <span className={styles.statValue}>{formatAmount(capital, currency?.symbol)}</span>
          </div>
        )}
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Баланс</span>
          <span className={styles.statValue}>{formatAmount(balance, currency?.symbol)}</span>
        </div>
      </div>

      <ProfileLink />

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={styles.navLink}>
            <span className={styles.navLinkContent}>
              <item.icon size={18} />
              {item.label}
              {item.to === '/support' && <SupportUnreadBadge className={styles.navBadge} />}
            </span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={styles.adminBorder} />
            <NavLink to="/admin" className={styles.navLink}>
              <span className={styles.navLinkContent}>
                <SettingsIcon size={18} />
                Админ-панель
                <AdminOpenBadge className={styles.navBadge} />
              </span>
            </NavLink>
          </>
        )}
      </nav>
    </>
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
                {item.to === '/support' && <SupportUnreadBadge className={styles.mobileNavBadge} />}
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
              <AdminOpenBadge className={styles.mobileNavBadge} />
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
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const currency = useCurrency();
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const showCapital =
    formatAmount(capital, currency?.symbol) !== formatAmount(balance, currency?.symbol);

  if (isDesktop) {
    return (
      <div className={styles.desktopRoot}>
        <div className={styles.desktopFrame}>
          <div className={styles.sidebar}>
            <VCard className={styles.sidebarCard}>
              <SidebarContent />
            </VCard>
          </div>

          <main ref={mainRef} className={styles.mainDesktop}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mobileRoot}>
      <header className={styles.mobileHeader}>
        <div className={styles.mobileStats}>
          {showCapital && (
            <div className={styles.mobileStat}>
              <span className={styles.mobileStatLabel}>Капитал</span>
              <span className={styles.mobileStatValue}>
                {formatAmount(capital, currency?.symbol)}
              </span>
            </div>
          )}
          <div className={styles.mobileStat}>
            <span className={styles.mobileStatLabel}>Баланс</span>
            <span className={styles.mobileStatValue}>
              {formatAmount(balance, currency?.symbol)}
            </span>
          </div>
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
