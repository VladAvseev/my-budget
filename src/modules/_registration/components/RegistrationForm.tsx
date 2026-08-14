import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../api/useRegistration';
import { confirmPasswordAtom, emailAtom, errorAtom, passwordAtom } from '../atoms/registration';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegistrationForm = () => {
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [confirmPassword, setConfirmPassword] = useAtom(confirmPasswordAtom);
  const [error, setError] = useAtom(errorAtom);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();

  const registration = useRegistration();
  const isEmpty = !email || !password || !confirmPassword;

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

    registration.mutate({ email, password });
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
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        error={emailError}
        disabled={registration.isPending}
        onChange={(value) => {
          setEmail(value);
          setEmailError(undefined);
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