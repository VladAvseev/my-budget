import { useAdminStatus } from '@/shared/api/hooks';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

const TOP_NAV_QUERY = '(min-width: 840px)';

// Каркас авторизованной части приложения: шапка, контент и нижняя навигация.
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAdmin } = useAdminStatus();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLElement>(null);
  const bottomNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  // Нижняя навигация закреплена через position: fixed (вне потока),
  // поэтому её высота передаётся контенту через --bottom-nav-height,
  // чтобы последний элемент страницы не перекрывался.
  // На широких экранах навигация скрыта (display: none) — высота станет 0.
  useEffect(() => {
    const nav = bottomNavRef.current;
    const root = rootRef.current;
    if (!nav || !root) return;
    const updateHeight = () => {
      root.style.setProperty('--bottom-nav-height', `${nav.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <TopBar topNavRef={topNavRef} isAdmin={isAdmin} />
      <main className={styles.main}>
        {children}
      </main>
      <BottomNav bottomNavRef={bottomNavRef} />
    </div>
  );
};
