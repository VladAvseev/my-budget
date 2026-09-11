import { api } from '@/shared/api/http';
import type { AdminAudience } from '@/shared/api/types/admin';
import { useQuery } from '@tanstack/react-query';

/** Одна точка графика динамики логов: непустой МСК-час. */
export interface AdminLogsDynamicsPoint {
  /** Начало МСК-часа как 'YYYY-MM-DDTHH:00:00' (wall-clock Москвы). */
  hour: string;
  count: number;
}

/** Ответ GET /admin/logs/dynamics. */
export interface AdminLogsDynamics {
  audience: AdminAudience;
  points: AdminLogsDynamicsPoint[];
}

/** Параметры GET /admin/logs/dynamics — query `audience`. */
export type UseAdminLogsDynamicsRequest = AdminAudience;

/** Ответ GET /admin/logs/dynamics. */
export type UseAdminLogsDynamicsResponse = AdminLogsDynamics;

/**
 * GET /admin/logs/dynamics?audience=: непустые МСК-часы количества логов.
 * audience: 'all' — все авторы, 'users' — только роль 'user' (без админов).
 */
export const useAdminLogsDynamics = (audience: UseAdminLogsDynamicsRequest) =>
  useQuery<UseAdminLogsDynamicsResponse>({
    queryKey: ['admin', 'logs', 'dynamics', audience],
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsDynamicsResponse>(`/admin/logs/dynamics?audience=${audience}`, {
        signal,
      }),
  });
