import type { Account } from '@/shared/api/types/domain';
import { atom } from 'jotai';

export const changePasswordOpenAtom = atom(false);
export const newPasswordAtom = atom('');
export const confirmNewPasswordAtom = atom('');

export const accountEditorAtom = atom<{ account: Account | null } | null>(null);
export const deletingAccountAtom = atom<Account | null>(null);
export const accountFormAtom = atom({ name: '', balance: '0' });
