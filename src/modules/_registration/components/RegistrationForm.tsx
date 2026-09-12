import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { validateLogin } from '@/shared/utils';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../api/useRegistration';
import { confirmPasswordAtom, errorAtom, loginAtom, passwordAtom } from '../atoms/registration';

export const RegistrationForm = () => {
  const [login, setLogin] = useAtom(loginAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [confirmPassword, setConfirmPassword] = useAtom(confirmPasswordAtom);
  const [error, setError] = useAtom(errorAtom);
  const [loginError, setLoginError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();

  const registration = useRegistration();
  const isEmpty = !login || !password || !confirmPassword;

  const validate = () => {
    let isValid = true;

    const invalidLogin = login === '' ? undefined : validateLogin(login);
    if (invalidLogin) {
      setLoginError(invalidLogin);
      isValid = false;
    } else {
      setLoginError(undefined);
    }

    if (password.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 символов');
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    if (password !== confirmPassword) {
      setConfirmError('Пароли не совпадают');
      isValid = false;
    } else {
      setConfirmError(undefined);
    }

    return isValid;
  };

  const handleSubmit = () => {
    setError(null);

    if (!validate()) {
      return;
    }

    registration.mutate({ login, password });
  };

  return (
    <div className={commonStyles.form}>
      <VBanner
        type="error"
        visible={Boolean(error)}
        message={error ?? ''}
        onClose={() => setError(null)}
      />

      <VTextInput
        label="Логин"
        autoComplete="username"
        placeholder="3–20 символов: буквы, цифры, _ - ."
        value={login}
        error={loginError}
        disabled={registration.isPending}
        onChange={(value) => {
          setLogin(value);
          setLoginError(undefined);
        }}
      />

      <VPasswordInput
        label="Пароль"
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        error={passwordError}
        disabled={registration.isPending}
        onChange={(value) => {
          setPassword(value);
          setPasswordError(undefined);
        }}
      />

      <VPasswordInput
        label="Подтверждение пароля"
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        error={confirmError}
        disabled={registration.isPending}
        onChange={(value) => {
          setConfirmPassword(value);
          setConfirmError(undefined);
        }}
      />

      <VButton onClick={handleSubmit} isLoading={registration.isPending} isDisabled={isEmpty}>
        Зарегистрироваться
      </VButton>

      <div className={commonStyles.linkRow}>
        <span>Уже есть аккаунт?&nbsp;</span>
        <Link to="/login" className={commonStyles.link}>
          Войти
        </Link>
      </div>
    </div>
  );
};
