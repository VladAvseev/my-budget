import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../api/useLogin';
import { emailAtom, errorAtom, passwordAtom } from '../atoms/login';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
  const styles = useThemeStyles();
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [error, setError] = useAtom(errorAtom);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const login = useLogin();
  const isEmpty = !email || !password;

  const validate = () => {
    let isValid = true;

    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Введите корректный email');
      isValid = false;
    } else {
      setEmailError(undefined);
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

    login.mutate({ email, password });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
      <VBanner
        type="error"
        visible={Boolean(error)}
        message={error ?? ''}
        onClose={() => setError(null)}
      />

      <VTextInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        error={emailError}
        disabled={login.isPending}
        onChange={(value) => {
          setEmail(value);
          setEmailError(undefined);
        }}
      />

      <VPasswordInput
        label="Пароль"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        error={passwordError}
        disabled={login.isPending}
        onChange={(value) => {
          setPassword(value);
          setPasswordError(undefined);
        }}
      />

      <VButton onClick={handleSubmit} isLoading={login.isPending} isDisabled={isEmpty}>
        Войти
      </VButton>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: styles.typography.fontSize.s,
          color: styles.colors.textSecondary,
        }}
      >
        <span>Нет аккаунта?&nbsp;</span>
        <Link to="/registration" style={{ color: styles.colors.accent, textDecoration: 'none' }}>
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
};
