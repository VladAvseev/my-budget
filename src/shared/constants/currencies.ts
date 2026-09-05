export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const QUICK_CURRENCIES = ['BYN', 'RUB', 'USD'] as const;

export const CURRENCIES: Currency[] = [
  { code: 'BYN', name: 'Белорусский рубль', symbol: 'Б' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
  { code: 'USD', name: 'Доллар', symbol: '$' },
];

export const getCurrencyByCode = (code: string | null): Currency | undefined =>
  CURRENCIES.find((c) => c.code === code);
