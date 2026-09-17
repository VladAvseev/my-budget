import { atomWithStorage } from 'jotai/utils';

export const selectedDisplayCurrencyAtom = atomWithStorage<string | null>(
  'capital-display-currency',
  null,
);
