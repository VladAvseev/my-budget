import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/users: таблица пользователей админки. */

/**
 * Строка таблицы пользователей админки. Ключи смешанные
 * (user_id/last_active_at в snake_case, счётчики в camelCase) — их ожидает
 * серверный AdminUserRow (JOIN + агрегаты).
 */
export interface AdminUserRow {
  user_id: string;
  email: string;
  last_active_at: string | null;
  onboarded: boolean;
  reportsCount: number;
  operationsCount: number;
  categoriesCount: number;
  incomeCount: number;
  dailyCount: number;
  expenseCount: number;
  savingsCount: number;
  accumulationsCount: number;
  goalsCount: number;
}

/** Запроса нет. */
export type UseAdminUsersRequest = void;

/** Ответ GET /admin/users. */
export type UseAdminUsersResponse = AdminUserRow[];

export const useAdminUsers = () =>
  useQuery<UseAdminUsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminUsersResponse>('/admin/users', { signal })) ?? [],
  });
