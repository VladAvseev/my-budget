export const convertAmount = (
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number => {
  if (from === to) return amount;
  const fromRate = rates[from.toLowerCase()];
  const toRate = rates[to.toLowerCase()];
  if (!fromRate || !toRate) return amount;
  return amount * (toRate / fromRate);
};
