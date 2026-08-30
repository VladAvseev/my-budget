import { atom } from 'jotai';

export const searchQueryAtom = atom('');
export const createModalOpenAtom = atom(false);
export const selectedMonthAtom = atom(new Date().getMonth());
export const selectedYearAtom = atom(new Date().getFullYear());
export const hasDailyExpensesAtom = atom(false);
export const hasDailyBudgetAtom = atom(false);
export const dailyBudgetAtom = atom('');
