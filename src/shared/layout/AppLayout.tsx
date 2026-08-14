import { COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import {
  HIDDEN_AMOUNT,
  useAmountsVisibility,
  useBreakpoint,
  useCapital,
  useGlobalBalance,
} from '@/shared/hooks';
import {
  HelpIcon,
  HomeIcon,
  MenuIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
  UserIcon,
  type IconProps,
} from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { formatAmount } from '@/shared/utils';
import { useState, type ComponentType, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

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
];

interface SidebarContentProps {
  setIsMenuOpen?: any;
}

const SidebarContent = ({ setIsMenuOpen }: SidebarContentProps) => {
  const styles = useThemeStyles();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { showBalance, showCapital } = useAmountsVisibility();

  return (
    <>
      <div
        style={{
          padding: styles.spacing.m,
          borderRadius: styles.radius.m,
          backgroundColor: withAlpha(styles.colors.accent, COLOR_PALETTE_BG_ALPHA),
          border: `1px solid ${styles.colors.accent}`,
          color: styles.colors.accent,
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          textAlign: 'center',
        }}
      >
        Капитал: {showCapital ? formatAmount(capital) : HIDDEN_AMOUNT}
      </div>

      <div
        style={{
          padding: styles.spacing.m,
          borderRadius: styles.radius.m,
          backgroundColor: withAlpha(styles.colors.accent, COLOR_PALETTE_BG_ALPHA),
          border: `1px solid ${styles.colors.accent}`,
          color: styles.colors.accent,
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          textAlign: 'center',
        }}
      >
        Баланс: {showBalance ? formatAmount(balance) : HIDDEN_AMOUNT}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onMouseEnter={() => setHoveredItem(item.to)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => {
              if (setIsMenuOpen) {
                setIsMenuOpen(false);
              }
            }}
            style={({ isActive }) => ({
              padding: `${styles.spacing.s} ${styles.spacing.m}`,
              borderRadius: styles.radius.m,
              textDecoration: 'none',
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.medium,
              color: isActive
                ? styles.colors.accent
                : hoveredItem === item.to
                  ? styles.colors.accent
                  : styles.colors.textSecondary,
              backgroundColor: isActive
                ? styles.colors.accentLight
                : hoveredItem === item.to
                  ? styles.colors.accentLight
                  : 'transparent',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            })}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: styles.spacing.s,
              }}
            >
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const styles = useThemeStyles();
  const { isDesktop } = useBreakpoint();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { balance } = useGlobalBalance();
  const { capital } = useCapital();
  const { showBalance, showCapital } = useAmountsVisibility();

  if (isDesktop) {
    return (
      <div
        style={{
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: styles.colors.bgPrimary,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1024px',
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 240,
              flexShrink: 0,
              alignSelf: 'stretch',
              padding: styles.spacing.l,
            }}
          >
            <VCard
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: styles.spacing.l,
                padding: styles.spacing.l,
                height: '100%',
              }}
            >
              <SidebarContent />
            </VCard>
          </div>

          <main
            style={{
              flex: 1,
              minWidth: 0,
              padding: styles.spacing.xl,
              overflowY: 'auto',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: styles.colors.bgPrimary,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.m,
          padding: `${styles.spacing.m} ${styles.spacing.l}`,
          backgroundColor: styles.colors.bgSurface,
          borderBottom: `1px solid ${styles.colors.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: styles.spacing.xs,
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
            }}
          >
            Капитал: {showCapital ? formatAmount(capital) : HIDDEN_AMOUNT}
          </div>
          <div
            style={{
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
            }}
          >
            Баланс: {showBalance ? formatAmount(balance) : HIDDEN_AMOUNT}
          </div>
        </div>
        <VIconButton
          ariaLabel="Открыть меню"
          onClick={() => setIsMenuOpen(true)}
          color={styles.colors.textPrimary}
        >
          <MenuIcon size={24} color={styles.colors.textPrimary} />
        </VIconButton>
      </div>

      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <VCard
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: styles.spacing.l,
              width: 280,
              maxWidth: '80%',
              height: '100%',
              borderRadius: 0,
              padding: styles.spacing.l,
            }}
          >
            <SidebarContent setIsMenuOpen={setIsMenuOpen} />
          </VCard>
        </div>
      )}

      <main
        style={{
          flex: 1,
          minHeight: 0,
          padding: styles.spacing.l,
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
};
