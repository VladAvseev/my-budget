import { atom } from 'jotai';

export const loginAtom = atom('');
export const passwordAtom = atom('');
export const confirmPasswordAtom = atom('');
export const errorAtom = atom<string | null>(null);
/**
 * Согласие на обработку ПДн: по умолчанию ОТМЕЧЕНО НЕ БЫЛО и не отмечается
 * программно (требование п.3) — false до явного клика пользователя.
 */
export const consentAtom = atom(false);
