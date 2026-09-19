import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/api/authProvider';
import { useAdminStatus } from '@/shared/api/hooks';
import { useBreakpoint } from '@/shared/hooks';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClearIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from '@/shared/icons';
import { useTheme } from '@/shared/theme/ThemeContext';
import styles from './ProfileLinks.module.css';

interface ProfileMenuContentProps {
  login: string;
  initial: string;
  isAdmin: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const ProfileMenuContent = ({
  login,
  initial,
  isAdmin,
  onClose,
  isMobile,
}: ProfileMenuContentProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <>
      <div className={styles.menuHeader}>
        <div className={styles.menuAvatar} aria-hidden="true">
          {initial}
        </div>
        <div className={styles.menuUserInfo}>
          <span className={styles.menuLogin}>{login || 'Пользователь'}</span>
          <span className={isAdmin ? styles.adminBadge : styles.userBadge}>
            {isAdmin ? 'Администратор' : 'Пользователь'}
          </span>
        </div>
        {isMobile && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <ClearIcon size={18} />
          </button>
        )}
      </div>

      <div className={styles.menuItems}>
        <button
          type="button"
          className={styles.menuItem}
          onClick={() => handleNavigate('/profile')}
        >
          <span className={styles.menuItemIcon} aria-hidden="true">
            <UserIcon size={18} />
          </span>
          <span className={styles.menuItemLabel}>Профиль и настройки</span>
          <span className={styles.menuItemChevron} aria-hidden="true">
            <ChevronRightIcon size={14} />
          </span>
        </button>

        {isAdmin && (
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => handleNavigate('/admin')}
          >
            <span className={styles.menuItemIcon} aria-hidden="true">
              <SettingsIcon size={18} />
            </span>
            <span className={styles.menuItemLabel}>Админ-панель</span>
            <span className={styles.menuItemChevron} aria-hidden="true">
              <ChevronRightIcon size={14} />
            </span>
          </button>
        )}

        <button
          type="button"
          className={styles.menuItem}
          onClick={handleToggleTheme}
        >
          <span className={styles.menuItemIcon} aria-hidden="true">
            <span className={styles.themeDot} data-theme={theme} />
          </span>
          <span className={styles.menuItemLabel}>
            Тема: {theme === 'dark' ? 'Тёмная' : 'Светлая'}
          </span>
          <span className={styles.themeToggleText}>
            {theme === 'dark' ? 'Светлая' : 'Тёмная'}
          </span>
        </button>

        <div className={styles.menuDivider} aria-hidden="true" />

        <button
          type="button"
          className={`${styles.menuItem} ${styles.logoutItem}`}
          onClick={handleSignOut}
        >
          <span className={styles.menuItemIcon} aria-hidden="true">
            <LogoutIcon size={18} />
          </span>
          <span className={styles.menuItemLabel}>Выйти</span>
        </button>
      </div>
    </>
  );
};

// Выпадающее меню профиля для десктопной шапки
export const ProfileLink = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const login = user?.login ?? '';
  const initial = login ? login[0].toUpperCase() : '?';
  const name = login || 'Профиль';

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleOutside = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handleOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={styles.desktopRoot}>
      <button
        type="button"
        className={`${styles.profileTrigger} ${isOpen ? styles.profileTriggerActive : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Профиль ${name}. Нажмите для открытия меню`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className={styles.profileAvatar} aria-hidden="true">
          {initial}
        </div>
        <span className={styles.profileName}>{name}</span>
        <span
          className={`${styles.profileChevron} ${isOpen ? styles.profileChevronOpen : ''}`}
          aria-hidden="true"
        >
          <ChevronDownIcon size={14} />
        </span>
      </button>

      {isOpen && (
        <div id={menuId} role="menu" className={styles.popover}>
          <ProfileMenuContent
            login={login}
            initial={initial}
            isAdmin={isAdmin}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

// Иконка профиля для мобильной шапки с вызовом Bottom Sheet
export const MobileProfileLink = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus();
  const { isMobile } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  const login = user?.login ?? '';
  const initial = login ? login[0].toUpperCase() : '?';

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Меню профиля"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={styles.mobileProfileLink}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.mobileAvatar} aria-hidden="true">
          {initial}
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            role="presentation"
          >
            <div
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label="Меню профиля"
              className={styles.sheet}
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <ProfileMenuContent
                login={login}
                initial={initial}
                isAdmin={isAdmin}
                onClose={() => setIsOpen(false)}
                isMobile
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

// Устаревший компонент мобильной ссылки на админку (функционал перенесен в меню профиля)
export const MobileAdminLink = () => null;
