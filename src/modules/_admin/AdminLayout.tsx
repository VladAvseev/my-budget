import { NavLink, Outlet } from 'react-router-dom';
import styles from './adminLayout.module.css';

interface AdminTab {
  label: string;
  to?: string;
  stub?: boolean;
}

const ADMIN_TABS: AdminTab[] = [
  { to: '/admin/dashboard', label: 'Дашборд' },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/admin/news', label: 'Что нового?' },
];

export const AdminLayout: React.FC = () => {
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
              {tab.label}
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
