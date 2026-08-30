export const getAmountError = (amount: string): string | undefined => {
  const amountValue = Number(amount);
  const isInvalid = !amount || Number.isNaN(amountValue) || amountValue < 0;
  if (!isInvalid) {
    return undefined;
  }
  return 'Укажите неотрицательную сумму';
};