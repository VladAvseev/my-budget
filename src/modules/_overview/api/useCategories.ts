import { api } from '@/shared/api/http';
import type { Category } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';




export type UseCategoriesResponse = Category[];

export const categoriesQueryKey = (userId: string) => ['categories', userId] as const;

const fetchCategories = async (signal: AbortSignal) =>
  (await api.get<UseCategoriesResponse>('/categories', { signal })) ?? [];


export const useCategories = (userId: string) =>
  useQuery<UseCategoriesResponse>({
    queryKey: categoriesQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchCategories(signal),
  });
