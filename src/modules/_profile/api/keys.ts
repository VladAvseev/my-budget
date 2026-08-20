import type { CategoryType } from '@/shared/supabase/types/domain';

export const categoriesQueryKey = (userId: string, type?: CategoryType) =>
  ['categories', userId, type] as const;