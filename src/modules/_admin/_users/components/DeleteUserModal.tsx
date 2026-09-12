import commonStyles from '@/shared/styles/common.module.css';
import type { AdminUserRow } from '../api/useAdminUsers';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import { useDeleteAdminUser } from '../api/useDeleteAdminUser';
import styles from './DeleteUserModal.module.css';

interface DeleteUserModalProps {
  user: AdminUserRow;
  onClose: () => void;
}

/**
 * Модалка подтверждения удаления: кнопка активна, только когда введён точный
 * логин пользователя (регистронезависимо). Размонтируется вместе с parent
 * (рендерится по условию), поэтому состояние ввода не нужно сбрасывать эффектом.
 */
export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, onClose }) => {
  const [confirmLogin, setConfirmLogin] = useState('');
  const deleteMutation = useDeleteAdminUser();

  const login = user.login;
  const isConfirmed =
    login !== '' && confirmLogin.trim().toLowerCase() === login.trim().toLowerCase();

  const handleConfirm = () => {
    if (!isConfirmed || deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate(user.user_id, { onSuccess: onClose });
  };

  return (
    <VModal
      visible
      title="Удаление пользователя"
      onClose={onClose}
      error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined}
      footer={
        <>
          <VButton variant="secondary" onClick={onClose} isDisabled={deleteMutation.isPending}>
            Отмена
          </VButton>
          <VButton
            variant="danger"
            onClick={handleConfirm}
            isLoading={deleteMutation.isPending}
            isDisabled={!isConfirmed}
          >
            Удалить
          </VButton>
        </>
      }
    >
      <div className={styles.body}>
        <p className={commonStyles.textSecondary}>
          Безвозвратно удалит аккаунт и все его данные: периоды, операции, категории, накопления и
          цели. Отменить это действие нельзя.
        </p>
        <p className={styles.confirmText}>
          Для подтверждения введите логин пользователя <span className={styles.login}>{login}</span>
          .
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
