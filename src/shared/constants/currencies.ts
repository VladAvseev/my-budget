export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'BYN', name: 'Белорусский рубль', symbol: 'Б' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
  { code: 'KZT', name: 'Тенге', symbol: '₸' },
  { code: 'UAH', name: 'Гривна', symbol: '₴' },
  { code: 'USD', name: 'Доллар', symbol: '$' },
  { code: 'EUR', name: 'Евро', symbol: '€' },
  { code: 'CNY', name: 'Юань', symbol: '¥' },
];

export const getCurrencyByCode = (code: string | null): Currency | undefined =>
  CURRENCIES.find((c) => c.code === code);
