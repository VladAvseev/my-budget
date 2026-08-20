import type { OperationType } from '@/shared/supabase/types/domain';
import type { CategoryType } from '@/shared/supabase/types/domain';

export const categoryTypeForOperation = (type: OperationType): CategoryType =>
  type === 'daily' ? 'expense' : type === 'savings_out' ? 'savings' : type;