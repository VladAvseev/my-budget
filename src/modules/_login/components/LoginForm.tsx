import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { validateLogin } from '@/shared/utils';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../api/useLogin';
import { errorAtom, loginAtom, passwordAtom } from '../atoms/login';

export const LoginForm = () => {
  const [login, setLogin] = useAtom(loginAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [error, setError] = useAtom(errorAtom);
  const [loginError, setLoginError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const loginMutation = useLogin();
  const isEmpty = !login || !password;

  const validate = () => {
    let isValid = true;

    const invalidLogin = login === '' ? undefined : validateLogin(login);
    if (invalidLogin) {
      setLoginError(invalidLogin);
      isValid = false;
    } else {
      setLoginError(undefined);
    }

    if (password.length < 6) {
      setPasswordError('Пароль должен содержать не менее 6 символов');
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    return isValid;
  };

  const handleSubmit = () => {
    setError(null);

    if (!validate()) {
      return;
    }

    loginMutation.mutate({ login, password });
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
        placeholder="my_login"
        value={login}
        error={loginError}
        disabled={loginMutation.isPending}
        onChange={(value) => {
          setLogin(value);
          setLoginError(undefined);
        }}
      />

      <VPasswordInput
        label="Пароль"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        error={passwordError}
        disabled={loginMutation.isPending}
        onChange={(value) => {
          setPassword(value);
          setPasswordError(undefined);
        }}
      />

      <VButton onClick={handleSubmit} isLoading={loginMutation.isPending} isDisabled={isEmpty}>
        Войти
      </VButton>

      <div className={commonStyles.linkRow}>
        <span>Нет аккаунта?&nbsp;</span>
        <Link to="/registration" className={commonStyles.link}>
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
};
