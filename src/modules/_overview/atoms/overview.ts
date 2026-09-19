import { atom } from 'jotai';

export const selectedMonthsAtom = atom<string[]>([]);
export const selectedDisplayCurrencyAtom = atom<string | null>(null);
export const comparedMonthAtom = atom<string>('');

export const selectedReportIdsAtom = selectedMonthsAtom;
export const comparedReportIdAtom = comparedMonthAtom;
