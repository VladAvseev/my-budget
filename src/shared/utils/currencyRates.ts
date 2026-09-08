import { type Currency, CURRENCIES } from '@/shared/constants/currencies';
import { convertAmount } from './convertCurrency';

export interface CurrencyRateItem {
  from: Currency;
  value: number;
}

export const getOtherCurrencyRates = (
  selectedCode: string | null,
  rates: Record<string, number> | undefined,
): CurrencyRateItem[] => {
  if (!selectedCode || !rates) return [];

  return CURRENCIES.filter((currency) => currency.code !== selectedCode).map((from) => ({
    from,
    value: convertAmount(1, from.code, selectedCode, rates),
  }));
};

export const formatCurrencyRate = (value: number): string =>
  value.toLocaleString('ru-RU', { maximumFractionDigits: 4 });
