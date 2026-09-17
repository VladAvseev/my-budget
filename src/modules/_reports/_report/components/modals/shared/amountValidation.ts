export const getAmountError = (amount: string): string | undefined => {
  const trimmed = amount.trim();
  const amountValue = Number(trimmed);
  if (trimmed === '' || !Number.isFinite(amountValue) || amountValue < 0) {
    return 'Укажите неотрицательную сумму';
  }
  return undefined;
};
