/**
 * Валидация суммы операции. Порог зеркалит серверный requireAmount(..., false)
 * (server/src/shared/validate.ts): 0 допустим, отрицательные — нет. Пустоту
 * проверяем явным сравнением строки: !amount считал бы валидный ноль «пусто».
 */
export const getAmountError = (amount: string): string | undefined => {
  const trimmed = amount.trim();
  const amountValue = Number(trimmed);
  if (trimmed === '' || !Number.isFinite(amountValue) || amountValue < 0) {
    return 'Укажите неотрицательную сумму';
  }
  return undefined;
};
