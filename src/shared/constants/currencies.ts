export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Графический знак белорусского рубля (кириллическая «Б» с горизонтальной
// чертой) — PUA-код U+E901 из официального иконочного шрифта НБ РБ «nbrb»
// (постановление Правления НБ РБ от 27.01.2026 № 25).
// Глиф подключается через @font-face в src/App.css.
export const BYN_SIGN = '\uE901';

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
