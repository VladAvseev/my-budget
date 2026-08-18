import {
  HIDDEN_AMOUNT,
  useAdminStatus,
  useAmountsVisibility,
  useBreakpoint,
  useCapital,
  useGlobalBalance,
} from '@/shared/hooks';
import {
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
import { useState, type ComponentType, type ReactNode } from 'react';
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
  { to: '/reports', label: 'Отчёты', icon: ReportsIcon },
  { to: '/accumulations', label: 'Накопления', icon: SavingsIcon },
  { to: '/overview', label: 'Обзор', icon: OverviewIcon },
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
  setIsMenuOpen?: any;
}

const SidebarContent = ({ setIsMenuOpen }: SidebarContentProps) => {
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { showBalance, showCapital } = useAmountsVisibility();
  const { isAdmin } = useAdminStatus();

  return (
    <>
      <div className={styles.stat}>
        Капитал: {showCapital ? formatAmount(capital) : HIDDEN_AMOUNT}
      </div>

      <div className={styles.stat}>
        Баланс: {showBalance ? formatAmount(balance) : HIDDEN_AMOUNT}
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
        <div className={styles.balanceInfo}>
          <div className={styles.balanceLabel}>
            Капитал: {showCapital ? formatAmount(capital) : HIDDEN_AMOUNT}
          </div>
          <div className={styles.balanceLabel}>
            Баланс: {showBalance ? formatAmount(balance) : HIDDEN_AMOUNT}
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