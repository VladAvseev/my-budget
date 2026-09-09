import type { AdminUserRow } from '@/shared/api/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useDeleteUser } from '../api/useDeleteUser';
import styles from './DeleteUserModal.module.css';

interface DeleteUserModalProps {
  user: AdminUserRow;
  onClose: () => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Модалка необратимого удаления пользователя: кнопка «Удалить» активна
 * только после того, как админ ввёл email цели целиком (сверка без учёта
 * регистра — в БД email хранится как citext).
 */
export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, onClose }) => {
  const deleteUser = useDeleteUser();
  const [confirmText, setConfirmText] = useState('');
  const [submitError, setSubmitError] = useState<string>();

  const isPending = deleteUser.isPending;
  const matchesEmail =
    confirmText.length > 0 && normalize(confirmText) === normalize(user.email);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleDelete = () => {
    if (!matchesEmail) return;
    setSubmitError(undefined);
    deleteUser.mutate(user.user_id, {
      onSuccess: onClose,
      onError: (error: Error) => {
        // Сервер всегда отдаёт русские сообщения в ApiError.message —
        // показываем их напрямую, чтобы не терять смысл (404/400/…).
        setSubmitError(error?.message || 'Не удалось удалить пользователя');
      },
    });
  };

  return (
    <VModal
      visible
      title="Удаление пользователя"
      onClose={handleClose}
      error={submitError}
      width="480px"
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
            Отмена
          </VButton>
          <VButton
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteUser.isPending}
            isDisabled={!matchesEmail || isPending}
          >
            Удалить навсегда
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        <div className={styles.warning}>
          Это удалит аккаунт <span className={styles.email}>{user.email}</span> и все его
          данные: отчёты, операции, категории, накопления, цели и активные сессии.
          Восстановление невозможно.
        </div>
        <VTextInput
          label="Введите email полностью, чтобы подтвердить"
          placeholder={user.email}
          value={confirmText}
          type="email"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={isPending}
          onChange={(value) => {
            setConfirmText(value);
            if (submitError) setSubmitError(undefined);
          }}
        />
      </div>
    </VModal>
  );
};
