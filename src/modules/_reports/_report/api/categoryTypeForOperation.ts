import type { ApiOperationType } from '@/shared/api/types/domain';
import type { CategoryType } from '@/shared/api/types/domain';


export const categoryTypeForOperation = (type: ApiOperationType): CategoryType | null =>
  type === 'transfer' ? null : type;
