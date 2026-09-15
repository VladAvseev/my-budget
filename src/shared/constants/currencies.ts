export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Текстовый код для строк; визуальный знак выводит общий компонент Amount.
export const BYN_SIGN = 'BYN';

export const QUICK_CURRENCIES = ['BYN', 'RUB', 'USD'] as const;

export const isQuickCurrency = (code: string | null): code is string =>
  code !== null && (QUICK_CURRENCIES as readonly string[]).includes(code);

export const CURRENCIES: Currency[] = [
  { code: 'BYN', name: 'Белорусский рубль', symbol: BYN_SIGN },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
  { code: 'USD', name: 'Доллар', symbol: '$' },
];

export const getCurrencyByCode = (code: string | null): Currency | undefined =>
  CURRENCIES.find((c) => c.code === code);
