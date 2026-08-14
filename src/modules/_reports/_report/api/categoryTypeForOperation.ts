import type { OperationType } from '@/shared/supabase/services/operations';
import type { CategoryType } from '@/shared/supabase/services/categories';

export const categoryTypeForOperation = (type: OperationType): CategoryType =>
  type === 'daily' ? 'expense' : type === 'savings_out' ? 'savings' : type;