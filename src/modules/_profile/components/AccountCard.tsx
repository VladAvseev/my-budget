import {
  useProfile,
  useDeleteAccount,
  useRevokeConsent,
  useConsentStatus,
} from '@/shared/api/hooks';
import { useAuth } from '@/shared/api/authProvider';
import { GATING_DOCUMENT_TYPE, legalDocumentPath } from '@/shared/legal/documents';
import { LegalLinks } from '@/shared/legal/LegalLinks';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VToggle } from '@/shared/ui/VToggle';
import { useTheme } from '@/shared/theme';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { formatDisplay, getErrorMessage } from '@/shared/utils';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { changePasswordOpenAtom } from '../atoms/profile';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { RevokeConsentModal } from './RevokeConsentModal';
import styles from './AccountCard.module.css';

export const AccountCard = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: consentStatus } = useConsentStatus();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useAtom(changePasswordOpenAtom);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [consentError, setConsentError] = useState<string>();

  const revokeConsent = useRevokeConsent();
  const deleteAccount = useDeleteAccount();

  const login = user?.login ?? '—';
  const initial = login !== '—' && login ? login[0].toUpperCase() : '?';
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

  
  const handleRevoke = () => {
    setConsentError(undefined);
    revokeConsent.mutate(undefined, {
      onSuccess: () => {
        setIsRevokeConfirmOpen(false);
        void signOut();
      },
      onError: (error) => setConsentError(getErrorMessage(error)),
    });
  };

  const handleDelete = () => {
    setConsentError(undefined);
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        void signOut();
      },
      onError: (error) => setConsentError(getErrorMessage(error)),
    });
  };

  return (
    <VCard className={styles.card}>
      <div className={styles.root}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.avatar} aria-hidden="true">
              {initial}
            </div>
            <div className={styles.heroText}>
              <span className={styles.heroLabel}>Логин</span>
              <h2 className={styles.login}>{login}</h2>
              {createdAt && <span className={styles.heroMeta}>На сайте с {createdAt}</span>}
            </div>
          </div>
        </div>

        <section aria-label="Оформление и пароль" className={styles.settingsGroup}>
          <VToggle
            className={styles.themeToggle}
            label={
              <span className={styles.themeText}>
                <span className={styles.themeLabel}>Тёмная тема</span>
                <span className={styles.themeHint}>Светлое или тёмное оформление приложения</span>
              </span>
            }
            checked={theme === 'dark'}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />

          <div className={styles.quickActions}>
            <VButton variant="secondary" onClick={() => setIsChangePasswordOpen(true)}>
              Сменить пароль
            </VButton>
            <VButton
              variant="danger"
              onClick={() => setIsLogoutConfirmOpen(true)}
              isDisabled={isSigningOut}
            >
              Выйти
            </VButton>
          </div>
        </section>

        <section aria-label="Опасная зона" className={styles.danger}>
          <h3 className={styles.dangerTitle}>Опасная зона</h3>
          <p className={styles.dangerHint}>
            Отзыв согласия или удаление аккаунта обезличивают все данные безвозвратно (в юридическом
            журнале остаются только факт и дата событий).
          </p>
          {consentError && (
            <VBanner
              type="error"
              visible
              message={consentError}
              onClose={() => setConsentError(undefined)}
            />
          )}
          <div className={styles.dangerActions}>
            <VButton
              variant="secondary"
              onClick={() => setIsRevokeConfirmOpen(true)}
              isDisabled={revokeConsent.isPending || deleteAccount.isPending}
            >
              Отозвать согласие
            </VButton>
            <VButton
              variant="danger"
              onClick={() => setIsDeleteConfirmOpen(true)}
              isDisabled={revokeConsent.isPending || deleteAccount.isPending}
            >
              Удалить аккаунт
            </VButton>
          </div>
        </section>

        
        <div className={styles.legalSection}>
          <span className={styles.legalTitle}>Правовые документы</span>
          <LegalLinks className={styles.legalNav} itemClassName={styles.legalLink} />
          {consentStatus?.grantedVersion && (
            <span className={styles.consentLine}>
              Согласие на обработку ПДн (политика конфиденциальности) принято для версии{' '}
              <Link
                to={legalDocumentPath(GATING_DOCUMENT_TYPE, consentStatus.grantedVersion)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.legalLink}
              >
                {consentStatus.grantedVersion}
              </Link>
            </span>
          )}
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

      <RevokeConsentModal
        visible={isRevokeConfirmOpen}
        login={login}
        isPending={revokeConsent.isPending}
        onClose={() => setIsRevokeConfirmOpen(false)}
        onConfirm={handleRevoke}
      />

      <DeleteAccountModal
        visible={isDeleteConfirmOpen}
        login={login}
        isPending={deleteAccount.isPending}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </VCard>
  );
};
