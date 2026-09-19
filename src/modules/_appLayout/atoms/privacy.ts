import { atomWithStorage } from 'jotai/utils';

export const hideBalanceAtom = atomWithStorage<boolean>('hide-balance', false);
