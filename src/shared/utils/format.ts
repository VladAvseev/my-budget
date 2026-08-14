export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
}