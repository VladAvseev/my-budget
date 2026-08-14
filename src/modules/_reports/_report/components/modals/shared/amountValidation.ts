export type AmountValidationMode = 'create' | 'edit';

export const getAmountError = (amount: string, mode: AmountValidationMode): string | undefined => {
  const amountValue = Number(amount);
  const isInvalid =
    !amount ||
    Number.isNaN(amountValue) ||
    (mode === 'create' ? amountValue < 0 : amountValue <= 0);
  if (!isInvalid) {
    return undefined;
  }
  return mode === 'create' ? 'Укажите неотрицательную сумму' : 'Укажите положительную сумму';
};