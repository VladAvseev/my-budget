import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/users/options: лёгкие id + email для селектов (без агрегатов). */

/** Опция пользователя: только идентификатор и email. */
export interface AdminUserOption {
  userId: string;
  email: string;
}

/** Запроса нет. */
export type UseAdminUserOptionsRequest = void;

/** Ответ GET /admin/users/options. */
export type UseAdminUserOptionsResponse = AdminUserOption[];

export const useAdminUserOptions = () =>
  useQuery<UseAdminUserOptionsResponse>({
    queryKey: ['admin', 'userOptions'],
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminUserOptionsResponse>('/admin/users/options', { signal })) ?? [],
    staleTime: 5 * 60_000,
  });
