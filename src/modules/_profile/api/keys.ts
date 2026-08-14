import type { CategoryType } from '@/shared/supabase/services/categories';

export const categoriesQueryKey = (userId: string, type?: CategoryType) =>
  ['categories', userId, type] as const;