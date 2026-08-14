import { atom } from 'jotai';

export const emailAtom = atom('');
export const passwordAtom = atom('');
export const confirmPasswordAtom = atom('');
export const errorAtom = atom<string | null>(null);