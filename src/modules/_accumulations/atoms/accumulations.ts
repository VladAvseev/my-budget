import type { Accumulation, Goal } from '@/shared/supabase/types/domain';
import { atom } from 'jotai';

export interface AccumulationModalState {
  accumulation: Accumulation | null;
}

export const accumulationModalAtom = atom<AccumulationModalState | null>(null);

export interface GoalModalState {
  goal: Goal | null;
}

export const goalModalAtom = atom<GoalModalState | null>(null);