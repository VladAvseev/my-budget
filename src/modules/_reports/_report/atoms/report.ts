import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import { atom } from 'jotai';

export interface OperationModalState {
  type: OperationType;
  operation: Operation | null;
}

export const operationModalAtom = atom<OperationModalState | null>(null);
export const groupedByTypeAtom = atom<Record<string, boolean>>({});