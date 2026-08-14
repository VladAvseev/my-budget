import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useChangePassword } from '../api/useChangePassword';
import { confirmNewPasswordAtom, newPasswordAtom } from '../atoms/profile';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ visible, onClose }: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useAtom(newPasswordAtom);
  const [confirmPassword, setConfirmPassword] = useAtom(confirmNewPasswordAtom);
  const [newPasswordError, setNewPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const changePassword = useChangePassword();

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordError(undefined);
    setConfirmError(undefined);
    setSubmitError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    let isValid = true;

    if (newPassword.length < 6) {
      setNewPasswordError('Пароль должен содержать не менее 6 символов');
      isValid = false;
    } else {
      setNewPasswordError(undefined);
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Пароли не совпадают');
      isValid = false;
    } else {
      setConfirmError(undefined);
    }

    if (!isValid) {
      return;
    }

    changePassword.mutate(newPassword, {
      onSuccess: (result) => {
        if (result.error) {
          setSubmitError(result.error.message);
          return;
        }
        handleClose();
      },
      onError: (error: Error) => setSubmitError(error.message),
    });
  };

  return (
    <VModal
      visible={visible}
      title="Смена пароля"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={changePassword.isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={changePassword.isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={commonStyles.columnL}>
        <VPasswordInput
          label="Новый пароль"
          autoComplete="new-password"
          placeholder="••••••••"
          value={newPassword}
          error={newPasswordError}
          disabled={changePassword.isPending}
          onChange={(value) => {
            setNewPassword(value);
            setNewPasswordError(undefined);
          }}
        />
        <VPasswordInput
          label="Подтверждение пароля"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          error={confirmError}
          disabled={changePassword.isPending}
          onChange={(value) => {
            setConfirmPassword(value);
            setConfirmError(undefined);
          }}
        />
      </div>
    </VModal>
  );
};