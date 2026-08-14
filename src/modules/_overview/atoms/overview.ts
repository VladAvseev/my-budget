import { atom } from 'jotai';

export const tabsExpandedAtom = atom(true);

export const excludedReportIdsAtom = atom<string[]>([]);
