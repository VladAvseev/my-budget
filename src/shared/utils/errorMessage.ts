const NETWORK_ERRORS: string[] = [
  'failed to fetch',
  'networkerror when attempting to fetch resource',
  'load failed',
  'network request failed',
  'network error',
  'the internet connection appears to be offline',
];

const KNOWN_ERRORS: Array<{ match: string; message: string }> = [
  { match: 'invalid login credentials', message: 'Неверный email или пароль' },
  { match: 'email not confirmed', message: 'Email не подтверждён' },
  { match: 'user already registered', message: 'Пользователь с таким email уже зарегистрирован' },
  {
    match: 'password should be at least 6 characters',
    message: 'Пароль должен содержать не менее 6 символов',
  },
  {
    match: 'unable to validate email address',
    message: 'Введите корректный email',
  },
  {
    match: 'new password should be different from the old password',
    message: 'Новый пароль должен отличаться от старого',
  },
  { match: 'user not found', message: 'Пользователь не найден' },
  {
    match: 'rate limit',
    message: 'Слишком много попыток. Попробуйте позже.',
  },
  {
    match: 'for security purposes, you can only request this after 60 seconds',
    message: 'Слишком много попыток. Попробуйте ещё раз через минуту.',
  },
];

const NETWORK_MESSAGE =
  'Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте ещё раз.';
const GENERIC_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз.';

const extractMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return '';
};

export const getErrorMessage = (error: unknown): string => {
  const message = extractMessage(error).toLowerCase();

  if (!message) {
    return GENERIC_MESSAGE;
  }

  if (NETWORK_ERRORS.some((pattern) => message.includes(pattern))) {
    return NETWORK_MESSAGE;
  }

  const known = KNOWN_ERRORS.find(({ match }) => message.includes(match));
  return known ? known.message : GENERIC_MESSAGE;
};
