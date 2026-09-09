const GENERIC_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз.';

interface ErrorShape {
  message: string;
  status?: number;
}

/**
 * Достаёт текст и HTTP-статус из ошибки в любом виде: `ApiError` (из
 * `shared/api/http`, несёт `status`), `AuthError` (объект `{ message, status }`)
 * или обычная `Error`/строка (без статуса).
 */
const readErrorShape = (error: unknown): ErrorShape => {
  if (error instanceof Error) {
    const { status } = error as { status?: unknown };
    return {
      message: error.message ?? '',
      status: typeof status === 'number' ? status : undefined,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  if (error && typeof error === 'object') {
    const candidate = error as { message?: unknown; status?: unknown };
    return {
      message: typeof candidate.message === 'string' ? candidate.message : '',
      status: typeof candidate.status === 'number' ? candidate.status : undefined,
    };
  }
  return { message: '' };
};

/**
 * Показываем текст ошибки ровно так, как его прислал сервер
 * (`errorMiddleware`: `{ error: { message, status } }`, `message` — уже
 * русскоязычный). Наличие HTTP-статуса ошибки — признак того, что до клиента
 * доехал ответ сервера, а не сетевой сбой или внутреннее исключение.
 * Если серверного сообщения нет (fetch упал без сети, внутренняя ошибка) —
 * возвращаем общую фразу.
 */
export const getErrorMessage = (error: unknown): string => {
  const { message, status } = readErrorShape(error);

  if (status !== undefined && status >= 400 && message.trim() !== '') {
    return message;
  }

  return GENERIC_MESSAGE;
};
