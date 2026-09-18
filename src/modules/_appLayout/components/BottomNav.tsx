import { NAV_ITEMS } from '../navItems';
import { type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

interface BottomNavProps {
  bottomNavRef: RefObject<HTMLElement | null>;
}

// Нижняя навигация для мобильных экранов.
export const BottomNav = ({ bottomNavRef }: BottomNavProps) => {
  return (
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
            {({ isActive }) => {
              const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
              return (
                <>
                  <span className={styles.pill} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span className={styles.bottomNavLabel}>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
