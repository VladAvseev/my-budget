import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { useState } from 'react';
import styles from './DeleteAccountConfirmModal.module.css';

interface DeleteAccountConfirmModalProps {
  visible: boolean;
  login: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Копия DeleteAccountModal из профиля для блокирующего окна согласий:
// shared не должен зависеть от modules, поэтому подтверждение вводом логина
// продублировано рядом с ConsentGate. Правится вместе с оригиналом.
export const DeleteAccountConfirmModal = ({
  visible,
  login,
  isPending,
  onClose,
  onConfirm,
}: DeleteAccountConfirmModalProps) => {
  const [confirmLogin, setConfirmLogin] = useState('');

  const isConfirmed =
    login.trim() !== '' &&
    login !== '—' &&
    confirmLogin.trim().toLowerCase() === login.trim().toLowerCase();

  const handleClose = () => {
    setConfirmLogin('');
    onClose();
  };

  const handleConfirm = () => {
    if (!isConfirmed || isPending) {
      return;
    }
    onConfirm();
  };

  return (
    <VModal
      visible={visible}
      title="Удалить аккаунт"
      onClose={handleClose}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
            Отмена
          </VButton>
          <VButton
            variant="danger"
            onClick={handleConfirm}
            isLoading={isPending}
            isDisabled={!isConfirmed}
          >
            Удалить навсегда
          </VButton>
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.warning}>
          <span className={styles.warningIcon} aria-hidden="true">
            !
          </span>
          <p className={`${commonStyles.textSecondary} ${styles.warningText}`}>
            Аккаунт и все финансовые данные будут удалены безвозвратно (в юридическом журнале
            согласий останутся только факт и дата обезличивания). Вы выйдете на всех устройствах.
          </p>
        </div>
        <p className={styles.confirmText}>
          Для подтверждения введите логин <span className={styles.login}>{login}</span>.
        </p>
        <VTextInput
          value={confirmLogin}
          onChange={setConfirmLogin}
          placeholder={login}
          autoComplete="off"
        />
      </div>
    </VModal>
  );
};
