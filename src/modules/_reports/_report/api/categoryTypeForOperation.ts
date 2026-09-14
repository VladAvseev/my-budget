import type { ApiOperationType } from '@/shared/api/types/domain';
import type { CategoryType } from '@/shared/api/types/domain';

/** У перевода категорий нет — возвращаем null, чтобы не тянуть запрос зря. */
export const categoryTypeForOperation = (type: ApiOperationType): CategoryType | null =>
  type === 'transfer' ? null : type === 'daily' ? 'expense' : type;
