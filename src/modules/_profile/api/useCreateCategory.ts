import { api } from '@/shared/api/http';
import type { Category, CategoryType } from '@/shared/api/types/domain';
import { invalidateHomeCaches } from '@/shared/api/hooks';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { trimStrings } from '@/shared/utils';
import { categoriesQueryKey } from './keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /categories с прежним оптимистичным обновлением:
 * добавляем черновик в кэш «все» и «по типу», при ошибке откатываем.
 */
const createCategoryMutationKey = ['createCategory'] as const;

/** Запрос POST /categories — payload модалки (прежний CategoryCreateInput). */
export interface UseCreateCategoryRequest {
  type: CategoryType;
  name: string;
  color?: string | null;
}

/** Ответ POST /categories — созданная категория (201). */
export type UseCreateCategoryResponse = Category;

/** Тело на проводе (серверный CreateCategoryInput). */
interface CreateCategoryBody {
  type: CategoryType;
  name: string;
  color: string | null;
}

export const useCreateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createCategoryMutationKey,
    mutationFn: async (input: UseCreateCategoryRequest) => {
      const body: CreateCategoryBody = {
        type: input.type,
        name: trimStrings(input.name),
        color: input.color ?? null,
      };
      return api.post<UseCreateCategoryResponse>('/categories', body);
    },
    onMutate: async (input) => {
      const allKey = categoriesQueryKey(userId);
      const typeKey = categoriesQueryKey(userId, input.type);
      const prevAll = queryClient.getQueryData<Category[]>(allKey) ?? [];
      const prevType = queryClient.getQueryData<Category[]>(typeKey) ?? [];

      const now = new Date().toISOString();
      const optimistic: Category & OptimisticItem = {
        id: createOptimisticId(),
        user_id: userId,
        type: input.type,
        name: input.name,
        color: input.color ?? null,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData<Category[]>(allKey, [...prevAll, optimistic]);
      queryClient.setQueryData<Category[]>(typeKey, [...prevType, optimistic]);

      return { allKey, typeKey, prevAll, prevType };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(context.allKey, context.prevAll);
      queryClient.setQueryData(context.typeKey, context.prevType);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
      invalidateHomeCaches(queryClient);
    },
  });
};
