import {
  HIDDEN_AMOUNT,
  useAdminStatus,
  useAmountsVisibility,
  useBreakpoint,
  useCapital,
  useCurrency,
  useGlobalBalance,
} from '@/shared/hooks';
import {
  BanknotesIcon,
  HelpIcon,
  HomeIcon,
  MenuIcon,
  MessageIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
  SettingsIcon,
  UserIcon,
  type IconProps,
} from '@/shared/icons';
import { useAdminSupportOpenCount } from '@/modules/_admin/_support/api/useAdminSupportOpenCount';
import { useAuth } from '@/shared/supabase/authProvider';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { formatAmount } from '@/shared/utils';
import {
  useState,
  type ComponentType,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { NavLink } from 'react-router-dom';
import { useSupportUnread } from '@/modules/_support/api/useSupportUnread';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Главная', icon: HomeIcon },
  { to: '/profile', label: 'Профиль', icon: UserIcon },
  { to: '/reports', label: 'Периоды', icon: ReportsIcon },
  { to: '/accumulations', label: 'Накопления', icon: SavingsIcon },
  { to: '/overview', label: 'Аналитика', icon: OverviewIcon },
  { to: '/help', label: 'Помощь', icon: HelpIcon },
  { to: '/support', label: 'Поддержка', icon: MessageIcon },
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

interface SidebarContentProps {
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

const SidebarContent = ({ setIsMenuOpen }: SidebarContentProps) => {
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { showBalance, showCapital } = useAmountsVisibility();
  const { isAdmin } = useAdminStatus();
  const currency = useCurrency();

  return (
    <>
      <div className={styles.brand}>
        <BanknotesIcon size={24} />
        <span className={styles.brandTitle}>Мой бюджет</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Капитал</span>
          <span className={styles.statValue}>
            {showCapital ? formatAmount(capital, currency?.symbol) : HIDDEN_AMOUNT}
          </span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Баланс</span>
          <span className={styles.statValue}>
            {showBalance ? formatAmount(balance, currency?.symbol) : HIDDEN_AMOUNT}
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              if (setIsMenuOpen) {
                setIsMenuOpen(false);
              }
            }}
            className={styles.navLink}
          >
            <span className={styles.navLinkContent}>
              <item.icon size={18} />
              {item.label}
              {item.to === '/support' && <SupportUnreadBadge className={styles.navBadge} />}
            </span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
          <div className={styles.adminBorder}/>
          <NavLink
            to="/admin"
            onClick={() => {
              if (setIsMenuOpen) {
                setIsMenuOpen(false);
              }
            }}
            className={styles.navLink}
            >
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

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isDesktop } = useBreakpoint();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { showBalance, showCapital } = useAmountsVisibility();
  const currency = useCurrency();

  if (isDesktop) {
    return (
      <div className={styles.desktopRoot}>
        <div className={styles.desktopFrame}>
          <div className={styles.sidebar}>
            <VCard className={styles.sidebarCard}>
              <SidebarContent />
            </VCard>
          </div>

          <main className={styles.mainDesktop}>{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mobileRoot}>
      <div className={styles.mobileHeader}>
        <div className={styles.mobileStats}>
          <div className={styles.mobileStat}>
            <span className={styles.mobileStatLabel}>Капитал</span>
            <span className={styles.mobileStatValue}>
              {showCapital ? formatAmount(capital, currency?.symbol) : HIDDEN_AMOUNT}
            </span>
          </div>
          <div className={styles.mobileStat}>
            <span className={styles.mobileStatLabel}>Баланс</span>
            <span className={styles.mobileStatValue}>
              {showBalance ? formatAmount(balance, currency?.symbol) : HIDDEN_AMOUNT}
            </span>
          </div>
        </div>
        <span className={styles.menuButtonWrapper}>
          <VIconButton
            ariaLabel="Открыть меню"
            onClick={() => setIsMenuOpen(true)}
            color="var(--color-text-primary)"
          >
            <MenuIcon size={24} color="currentColor" />
          </VIconButton>
          <SupportUnreadBadge className={styles.menuBadge} />
          <AdminOpenBadge className={styles.menuAdminBadge} />
        </span>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <div onClick={() => setIsMenuOpen(false)} className={styles.mobileMenuBackdrop} />
          <VCard className={styles.mobileMenuPanel}>
            <SidebarContent setIsMenuOpen={setIsMenuOpen} />
          </VCard>
        </div>
      )}

      <main className={styles.mainMobile}>{children}</main>
    </div>
  );
};