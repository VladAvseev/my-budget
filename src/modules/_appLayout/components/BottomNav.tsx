import { useEffect, useRef, useState, type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { PlusIcon } from '@/shared/icons';
import { NAV_ITEMS } from '../navItems';
import styles from './BottomNav.module.css';

interface BottomNavProps {
  bottomNavRef: RefObject<HTMLElement | null>;
}

// Нижняя навигация для мобильных экранов (M3E Navigation Bar).
export const BottomNav = ({ bottomNavRef }: BottomNavProps) => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // Scroll-aware Hide/Show (Вариант А).
  // Внизу страницы навигация всегда видна: иначе под контентом
  // остаётся пустая полоса высотой с навигацию.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;
      const distanceToBottom =
        document.documentElement.scrollHeight - (currentScrollY + window.innerHeight);

      if (currentScrollY <= 20 || distanceToBottom <= 24) {
        setIsHidden(false);
      } else if (diff > 8 && currentScrollY > 60) {
        setIsHidden(true);
      } else if (diff < -8) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const firstItems = NAV_ITEMS.slice(0, 2);
  const lastItems = NAV_ITEMS.slice(2);

  const renderNavItem = (item: (typeof NAV_ITEMS)[number]) => (
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
  );

  return (
    <nav
      ref={bottomNavRef}
      className={`${styles.bottomNav} ${isHidden ? styles.bottomNavHidden : ''}`}
      aria-label="Основная навигация"
    >
      <div className={styles.bottomNavList}>
        {firstItems.map(renderNavItem)}

        {/* Центральный M3E FAB-заглушка (Вариант В) */}
        <div className={styles.fabContainer}>
          <button
            type="button"
            className={styles.fabStub}
            aria-label="Быстрое добавление (скоро)"
            title="Быстрое добавление (скоро)"
          >
            <PlusIcon size={22} />
          </button>
        </div>

        {lastItems.map(renderNavItem)}
      </div>
    </nav>
  );
};
