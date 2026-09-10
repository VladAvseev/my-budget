import { api } from '@/shared/api/http';
import type { AdminUserRow } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/users: таблица пользователей админки. */
export const useAdminUsers = () =>
  useQuery<AdminUserRow[]>({
    queryKey: ['admin', 'users'],
    queryFn: async ({ signal }) =>
      (await api.get<AdminUserRow[]>('/admin/users', { signal })) ?? [],
  });
