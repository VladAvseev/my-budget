import { useAuth } from '@/shared/api/authProvider';
import {
  ChevronRightIcon,
  SettingsFilledIcon,
  SettingsIcon,
  UserFilledIcon,
  UserIcon,
} from '@/shared/icons';
import { NavLink } from 'react-router-dom';
import styles from './ProfileLinks.module.css';

// Ссылка на профиль для десктопной шапки (аватар с инициалом и логин).
export const ProfileLink = () => {
  const { user } = useAuth();

  const login = user?.login ?? '';
  const initial = login ? login[0].toUpperCase() : '?';
  const name = login || 'Профиль';

  return (
    <NavLink to="/profile" className={styles.profileLink}>
      <div className={styles.profileAvatar} aria-hidden="true">
        {initial}
      </div>
      <span className={styles.profileName}>{name}</span>
      <span className={styles.profileChevron} aria-hidden="true">
        <ChevronRightIcon size={14} />
      </span>
    </NavLink>
  );
};

// Иконка профиля для мобильной шапки.
export const MobileProfileLink = () => (
  <NavLink
    to="/profile"
    aria-label="Профиль"
    className={styles.mobileProfileLink}
  >
    {({ isActive }) => (isActive ? <UserFilledIcon size={22} /> : <UserIcon size={22} />)}
  </NavLink>
);

// Иконка админ-панели для мобильной шапки (только у администраторов).
export const MobileAdminLink = () => (
  <NavLink
    to="/admin"
    aria-label="Админ-панель"
    className={styles.mobileAdminLink}
  >
    {({ isActive }) => (isActive ? <SettingsFilledIcon size={22} /> : <SettingsIcon size={22} />)}
  </NavLink>
);
