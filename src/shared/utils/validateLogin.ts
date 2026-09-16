/**
 * Валидация логина: один набор правил и один текст ошибки на весь клиент
 * (формы входа и регистрации). Зеркалит normalizeLogin() серверного
 * _auth/service.ts — форма должна пропускать ровно то, что примет сервер.
 */

/** 3–20 символов: латиница/кириллица/цифры и _ - . */
const LOGIN_REGEX = /^[a-zа-яё0-9_.-]{3,20}$/;

export const INVALID_LOGIN_MESSAGE = 'Логин: 3–20 символов: буквы, цифры, _ - .';

/**
 * Нормализация и валидация: trim + нижний регистр, затем regex допустимых
 * символов. null — логин недопустим; нормализованное значение — тот вид,
 * в котором он уходит на сервер (citext ищет регистронезависимо).
 */
export const normalizeLogin = (login: string): string | null => {
  const value = login.trim().toLowerCase();
  return LOGIN_REGEX.test(value) ? value : null;
};

/** Текст ошибки для подложного логина (пустой value валидатор не вызывается). */
export const validateLogin = (login: string): string | undefined =>
  normalizeLogin(login) === null ? INVALID_LOGIN_MESSAGE : undefined;
