import { useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useDeleteAccount, useRevokeConsent } from '@/shared/api/hooks';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { getErrorMessage } from '@/shared/utils';
import { DeleteAccountModal } from './DeleteAccountModal';
import { RevokeConsentModal } from './RevokeConsentModal';
import styles from './DangerZone.module.css';

export const DangerZone = () => {
  const { user, signOut } = useAuth();
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [consentError, setConsentError] = useState<string>();

  const revokeConsent = useRevokeConsent();
  const deleteAccount = useDeleteAccount();

  const login = user?.login ?? '—';

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

  const isPending = revokeConsent.isPending || deleteAccount.isPending;

  return (
    <VCard className={styles.card}>
      <div className={styles.root}>
        <h3 className={styles.title}>Опасная зона</h3>
        <p className={styles.hint}>
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

        <div className={styles.actions}>
          <VButton
            variant="secondary"
            onClick={() => setIsRevokeConfirmOpen(true)}
            isDisabled={isPending}
          >
            Отозвать согласие
          </VButton>
          <VButton
            variant="danger"
            onClick={() => setIsDeleteConfirmOpen(true)}
            isDisabled={isPending}
          >
            Удалить аккаунт
          </VButton>
        </div>
      </div>

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
