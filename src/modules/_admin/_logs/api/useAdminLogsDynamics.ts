import { api } from '@/shared/api/http';
import type { AdminAudience, AdminLogsDynamics } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /admin/logs/dynamics?audience=: непустые МСК-часы количества логов.
 * audience: 'all' — все авторы, 'users' — только роль 'user' (без админов).
 */
export const useAdminLogsDynamics = (audience: AdminAudience) =>
  useQuery<AdminLogsDynamics>({
    queryKey: ['admin', 'logs', 'dynamics', audience],
    queryFn: ({ signal }) =>
      api.get<AdminLogsDynamics>(`/admin/logs/dynamics?audience=${audience}`, { signal }),
  });
