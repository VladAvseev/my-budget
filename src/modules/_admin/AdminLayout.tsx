import { NavLink, Outlet } from 'react-router-dom';
import { VBadge } from '@/shared/ui/VBadge';
import { useAdminSupportOpenCount } from './_support/api/useAdminSupportOpenCount';
import styles from './adminLayout.module.css';

interface AdminTab {
  label: string;
  to?: string;
  stub?: boolean;
}

const ADMIN_TABS: AdminTab[] = [
  { to: '/admin/dashboard', label: 'Дашборд' },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/admin/support', label: 'Обращения' },
  { to: '/admin/news', label: 'Что нового?' },
];

export const AdminLayout: React.FC = () => {
  const openCountQuery = useAdminSupportOpenCount();
  const openCount = openCountQuery.data ?? 0;

  return (
    <div className={styles.root}>
      <nav className={styles.tabs}>
        {ADMIN_TABS.map((tab) =>
          tab.stub ? (
            <span key={tab.label} className={styles.tabStub}>
              {tab.label}
            </span>
          ) : (
            <NavLink key={tab.to} to={tab.to ?? ''} className={styles.tabLink}>
              <span className={styles.tabLabel}>
                {tab.label}
                {tab.to === '/admin/support' && openCount > 0 && (
                  <VBadge variant="accent">{openCount}</VBadge>
                )}
              </span>
            </NavLink>
          ),
        )}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};