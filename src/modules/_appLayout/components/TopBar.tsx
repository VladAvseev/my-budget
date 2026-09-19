import { VButton } from '@/shared/ui/VButton';
import { type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { NAV_ITEMS } from '../navItems';
import { createOperationOpenAtom } from '../atoms/operationModal';
import { AccountsBalanceBadge } from './AccountsBalanceBadge';
import { MobileProfileLink, ProfileLink } from './ProfileLinks';
import styles from './TopBar.module.css';
import { PlusIcon } from '@/shared/icons';

interface TopBarProps {
  topNavRef: RefObject<HTMLElement | null>;
  isAdmin?: boolean;
}

// Верхняя шапка приложения: бренд, основная навигация и действия (капитал, профиль).
export const TopBar = ({ topNavRef }: TopBarProps) => {
  const setCreateOpen = useSetAtom(createOperationOpenAtom);
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <VButton className={styles.addButton} onClick={() => setCreateOpen(true)}><PlusIcon />Добавить операцию</VButton>

        <nav ref={topNavRef} className={styles.topNav} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-nav-to={item.to}
              className={styles.navLink}
            >
              {({ isActive }) => {
                const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
                return (
                  <span className={styles.navLinkContent}>
                    <Icon size={18} />
                    {item.label}
                  </span>
                );
              }}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <AccountsBalanceBadge />
          <ProfileLink />
          <MobileProfileLink />
        </div>
      </div>
    </header>
  );
};
