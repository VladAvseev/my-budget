import { type Operation, type OperationType } from '@/shared/api/types/domain';

export interface OperationAmounts {
  income: number;
  expense: number;
}

export const emptyAmounts: OperationAmounts = { income: 0, expense: 0 };

export const sumOperations = (operations: Operation[]): OperationAmounts => {
  const total: OperationAmounts = { ...emptyAmounts };
  for (const operation of operations) {
    const type = operation.type as OperationType;
    const amount = Number(operation.amount) || 0;
    if (type === 'income' || type === 'expense') {
      total[type as keyof OperationAmounts] += amount;
    }
  }
  return total;
};
