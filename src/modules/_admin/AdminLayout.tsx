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
  { to: '/admin/logs', label: 'Логи' },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className={styles.root}>
      <nav className={styles.tabs} aria-label="Разделы администрирования">
        <ul className={styles.tabList}>
          {ADMIN_TABS.map((tab) => (
            <li key={tab.to ?? tab.label} className={styles.tabItem}>
              {tab.stub ? (
                <span className={styles.tabStub}>{tab.label}</span>
              ) : (
                <NavLink to={tab.to ?? ''} className={styles.tabLink}>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
