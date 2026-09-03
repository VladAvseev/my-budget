export function formatAmount(value: number, currencySymbol?: string | null): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const formatted = value.toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
  return currencySymbol ? `${formatted} ${currencySymbol}` : formatted;
}