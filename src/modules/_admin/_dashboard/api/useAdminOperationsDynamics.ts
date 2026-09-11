import { api } from '@/shared/api/http';
import type { AdminAudience } from '@/shared/api/types/admin';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /admin/dashboard/operations-dynamics?audience=:
 * [{ day, operations_count }] — сутки по московскому времени.
 * audience: 'all' — все операции, 'users' — только пользователей (без админов).
 */

/** Одна строка ответа (имена колонок SQL-запроса, серверный AdminDynamicsRow). */
export interface AdminOperationsDynamicsRow {
  day: string;
  operations_count: number;
}

/** Фильтр запроса — query `audience`. */
export type UseAdminOperationsDynamicsRequest = AdminAudience;

/** Ответ GET /admin/dashboard/operations-dynamics. */
export type UseAdminOperationsDynamicsResponse = AdminOperationsDynamicsRow[];

export const useAdminOperationsDynamics = (audience: AdminAudience = 'all') =>
  useQuery<UseAdminOperationsDynamicsResponse>({
    queryKey: ['admin', 'operationsDynamics', audience],
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminOperationsDynamicsResponse>(
        `/admin/dashboard/operations-dynamics?audience=${audience}`,
        { signal },
      )) ?? [],
  });
