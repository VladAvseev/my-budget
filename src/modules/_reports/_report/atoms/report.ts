import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { atom } from 'jotai';

export interface OperationModalState {
  type: ApiOperationType;
  operation: Operation | null;
  isDeletable?: boolean;
}

export const operationModalAtom = atom<OperationModalState | null>(null);
export const groupedByTypeAtom = atom<Record<string, boolean>>({});
