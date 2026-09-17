const GENERIC_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз.';

interface ErrorShape {
  message: string;
  status?: number;
}

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

export const getErrorMessage = (error: unknown): string => {
  const { message, status } = readErrorShape(error);

  if (status !== undefined && status >= 400 && message.trim() !== '') {
    return message;
  }

  return GENERIC_MESSAGE;
};
