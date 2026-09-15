import { atomWithStorage } from 'jotai/utils';

// Независимая от Аналитики выбранная валюта раздела: сохраняется между перезагрузками.
export const selectedDisplayCurrencyAtom = atomWithStorage<string | null>(
  'capital-display-currency',
  null,
);
