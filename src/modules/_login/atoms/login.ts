import { atom } from 'jotai';

export const loginAtom = atom('');
export const passwordAtom = atom('');
export const errorAtom = atom<string | null>(null);
