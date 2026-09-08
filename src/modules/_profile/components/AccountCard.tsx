import { useProfile } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { formatDisplay } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { changePasswordOpenAtom } from '../atoms/profile';
import { ChangePasswordModal } from './ChangePasswordModal';
import styles from './AccountCard.module.css';

export const AccountCard = () => {
  const { user } = useAuth();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useAtom(changePasswordOpenAtom);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const email = user?.email ?? '—';
  const initial = email !== '—' && email ? email[0].toUpperCase() : '?';
  const createdAt = profile?.created_at ? formatDisplay(profile.created_at.slice(0, 10)) : null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <VCard>
      <div className={commonStyles.columnL}>
        <div className={commonStyles.titleXl}>Аккаунт</div>

        <div className={styles.accountHeader}>
          <div className={commonStyles.avatar}>{initial}</div>
          <div className={styles.accountInfo}>
            <span className={commonStyles.infoLabel}>Email</span>
            <span className={styles.accountEmail}>{email}</span>
            {createdAt && <span className={commonStyles.infoLabel}>На сайте с {createdAt}</span>}
          </div>
        </div>

        <div className={styles.actionsRow}>
          <VButton variant="secondary" onClick={() => setIsChangePasswordOpen(true)}>
            Сменить пароль
          </VButton>
          <VButton
            variant="danger"
            onClick={() => setIsLogoutConfirmOpen(true)}
            isDisabled={isSigningOut}
            className={styles.logoutButton}
          >
            Выйти
          </VButton>
        </div>
      </div>

      <ChangePasswordModal
        visible={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <VConfirmModal
        visible={isLogoutConfirmOpen}
        title="Выйти из аккаунта"
        message="Вы действительно хотите выйти из аккаунта?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleSignOut}
      />
    </VCard>
  );
};
