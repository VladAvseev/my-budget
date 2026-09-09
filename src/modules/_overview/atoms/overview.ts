import { atom } from 'jotai';

export const selectedReportIdsAtom = atom<string[]>([]);
export const selectedDisplayCurrencyAtom = atom<string | null>(null);
export const comparedReportIdAtom = atom<string>('');
