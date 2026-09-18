import { NAV_ITEMS } from '../navItems';
import { SettingsFilledIcon, SettingsIcon } from '@/shared/icons';
import { VBrand } from '@/shared/ui/VBrand';
import { type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { AccountsBalanceBadge } from './AccountsBalanceBadge';
import { MobileAdminLink, MobileProfileLink, ProfileLink } from './ProfileLinks';
import styles from './TopBar.module.css';

interface TopBarProps {
  topNavRef: RefObject<HTMLElement | null>;
  isAdmin: boolean;
}

// Верхняя шапка приложения: бренд, основная навигация и действия (бейдж капитала, профиль).
export const TopBar = ({ topNavRef, isAdmin }: TopBarProps) => {
  return (
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

          {isAdmin && (
            <>
              <div className={styles.adminDivider} aria-hidden="true" />
              <NavLink to="/admin" data-nav-to="/admin" className={styles.navLink}>
                {({ isActive }) => (
                  <span className={styles.navLinkContent}>
                    {isActive ? <SettingsFilledIcon size={18} /> : <SettingsIcon size={18} />}
                    Админ-панель
                  </span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          <AccountsBalanceBadge />
          <ProfileLink />
          {isAdmin && <MobileAdminLink />}
          <MobileProfileLink />
        </div>
      </div>
    </header>
  );
};
