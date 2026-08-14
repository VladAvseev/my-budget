import { atom } from 'jotai';

export const searchQueryAtom = atom('');
export const createModalOpenAtom = atom(false);
export const reportNameAtom = atom('');
export const hasDailyExpensesAtom = atom(false);
export const hasDailyBudgetAtom = atom(false);
export const dailyBudgetAtom = atom('');
export const periodStartAtom = atom('');
export const periodEndAtom = atom('');