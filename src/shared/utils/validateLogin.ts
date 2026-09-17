const LOGIN_REGEX = /^[a-zа-яё0-9_.-]{3,20}$/;

export const INVALID_LOGIN_MESSAGE = 'Логин: 3–20 символов: буквы, цифры, _ - .';

export const normalizeLogin = (login: string): string | null => {
  const value = login.trim().toLowerCase();
  return LOGIN_REGEX.test(value) ? value : null;
};

export const validateLogin = (login: string): string | undefined =>
  normalizeLogin(login) === null ? INVALID_LOGIN_MESSAGE : undefined;
