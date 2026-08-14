import type { Accumulation } from '@/shared/supabase/services/accumulations';
import { atom } from 'jotai';

export interface AccumulationModalState {
  accumulation: Accumulation | null;
}

export const accumulationModalAtom = atom<AccumulationModalState | null>(null);