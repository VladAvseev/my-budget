import { api } from '@/shared/api/http';
import type { AdminUserRow } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/users (порт admin_get_users): таблица пользователей админки. */
export const useAdminUsers = () =>
  useQuery<AdminUserRow[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get<AdminUserRow[]>('/admin/users')) ?? [],
  });
