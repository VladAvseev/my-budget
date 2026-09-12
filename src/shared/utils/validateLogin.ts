/**
 * Валидация логина: один набор правил и один текст ошибки на весь клиент
 * (формы входа и регистрации). Зеркалит normalizeLogin() серверного
 * _auth/service.ts — форма должна пропускать ровно то, что примет сервер.
 *
 * Единый отказной текст (по требованию продукта) не различает почту,
 * телефон и ФИО: «Логин не должен быть почтой, ФИО или телефоном».
 */

/** 3–20 символов: латиница/кириллица/цифры и _ - . (пробелы отсекают ФИО). */
const LOGIN_REGEX = /^[a-zа-яё0-9_.-]{3,20}$/;

/** Окончание как у домена почты: «ivanov.com». */
const EMAIL_TLD_SUFFIX_REGEX = /\.(com|ru|by|net|org)$/;

/** Телефон после вычитания разделителей: подряд 6+ цифр без букв. */
const PHONE_LIKE_REGEX = /^\d{6,}$/;

/** Длинная «только цифры» последовательность внутри логина (номер телефона/карты). */
const LONG_DIGIT_RUN_REGEX = /\d{10,}/;

export const INVALID_LOGIN_MESSAGE = 'Логин не должен быть почтой, ФИО или телефоном';

/**
 * Нормализация и валидация: trim + нижний регистр, затем regex допустимых
 * символов и блоки «почта/телефон». null — логин недопустим; нормализованное
 * значение — тот вид, в котором он уходит на сервер (citext ищет регистронезависимо).
 */
export const normalizeLogin = (login: string): string | null => {
  const value = login.trim().toLowerCase();
  if (!LOGIN_REGEX.test(value)) {
    return null;
  }
  if (EMAIL_TLD_SUFFIX_REGEX.test(value)) {
    return null;
  }
  if (PHONE_LIKE_REGEX.test(value.replace(/[-._\s]/g, ''))) {
    return null;
  }
  if (LONG_DIGIT_RUN_REGEX.test(value)) {
    return null;
  }
  return value;
};

/** Текст ошибки для подложного логина (пустой value валидатор не вызывается). */
export const validateLogin = (login: string): string | undefined =>
  normalizeLogin(login) === null ? INVALID_LOGIN_MESSAGE : undefined;
