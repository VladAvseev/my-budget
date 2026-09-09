import type { OperationType } from '@/shared/api/types/domain';
import type { CategoryType } from '@/shared/api/types/domain';

export const categoryTypeForOperation = (type: OperationType): CategoryType =>
  type === 'daily' ? 'expense' : type === 'savings_out' ? 'savings' : type;
