import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCheckbox } from '@/shared/ui/VCheckbox';
import { validateLogin } from '@/shared/utils';
import { VPasswordInput } from '@/shared/ui/VPasswordInput';
import { VTextInput } from '@/shared/ui/VTextInput';
import { GATING_DOCUMENT_TYPE, legalDocumentPath } from '@/shared/legal/documents';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../api/useRegistration';
import {
  confirmPasswordAtom,
  consentAtom,
  errorAtom,
  loginAtom,
  passwordAtom,
} from '../atoms/registration';

export const RegistrationForm = () => {
  const [login, setLogin] = useAtom(loginAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [confirmPassword, setConfirmPassword] = useAtom(confirmPasswordAtom);
  const [consent, setConsent] = useAtom(consentAtom);
  const [error, setError] = useAtom(errorAtom);
  const [loginError, setLoginError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();

  const registration = useRegistration();
  // Кнопка заблокирована, пока чекбокс согласия не отмечен вручную (п.3) —
  // сервер всё равно проверит флаг повторно (п.4), обход UI не создаёт аккаунт.
  const isEmpty = !login || !password || !confirmPassword || !consent;

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

    registration.mutate({ login, password, consent });
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

      {/* Неотмеченный по умолчанию чекбокс + явные ссылки на оба документа
          (требование п.3): принятие «Политики конфиденциальности» считается
          согласием на обработку ПДн. Без чекбокса кнопка сабмита неактивна,
          сервер всё равно проверит флаг повторно (п.4), обход UI не создаёт
          аккаунт. */}
      <VCheckbox checked={consent} onChange={setConsent} disabled={registration.isPending}>
        Принимаю{' '}
        <Link
          to={legalDocumentPath(GATING_DOCUMENT_TYPE)}
          target="_blank"
          rel="noopener noreferrer"
          className={commonStyles.link}
        >
          «Политику конфиденциальности»
        </Link>{' '}
        (даю согласие на обработку персональных данных) и{' '}
        <Link
          to={legalDocumentPath('terms_of_use')}
          target="_blank"
          rel="noopener noreferrer"
          className={commonStyles.link}
        >
          «Пользовательское соглашение»
        </Link>
      </VCheckbox>

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
