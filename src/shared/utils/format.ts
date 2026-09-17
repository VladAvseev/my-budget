import { convertAmount } from './convertCurrency';

export const percentOfIncome = (value: number, income: number): number | null =>
  income > 0 && Number.isFinite(income) && Number.isFinite(value)
    ? Math.round((value / income) * 100)
    : null;

export interface ConvertOptions {
  from: string;
  to: string;
  rates: Record<string, number>;
}

export function formatAmount(
  value: number,
  currencySymbol?: string | null,
  convert?: ConvertOptions,
): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const converted = convert ? convertAmount(value, convert.from, convert.to, convert.rates) : value;
  const formatted = converted.toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
  return currencySymbol ? `${formatted} ${currencySymbol}` : formatted;
}
