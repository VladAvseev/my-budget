import { OverviewIcon, ReportsIcon, UserIcon, type IconProps } from '@/shared/icons';
import type { ComponentType } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './adminLayout.module.css';

interface AdminTab {
  label: string;
  to?: string;
  stub?: boolean;
  icon: ComponentType<IconProps>;
}

const ADMIN_TABS: AdminTab[] = [
  { to: '/admin/dashboard', label: 'Дашборд', icon: OverviewIcon },
  { to: '/admin/users', label: 'Пользователи', icon: UserIcon },
  { to: '/admin/logs', label: 'Логи', icon: ReportsIcon },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className={styles.root}>
      <nav className={styles.tabs} aria-label="Разделы администрирования">
        <ul className={styles.tabList}>
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.to ?? tab.label} className={styles.tabItem}>
                {tab.stub ? (
                  <span className={styles.tabStub}>
                    <Icon size={18} />
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </span>
                ) : (
                  <NavLink to={tab.to ?? ''} className={styles.tabLink}>
                    <Icon size={18} />
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
