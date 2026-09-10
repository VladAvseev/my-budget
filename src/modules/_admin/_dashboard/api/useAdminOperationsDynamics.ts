import { api } from '@/shared/api/http';
import type { AdminAudience } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';
import type { DynamicsDailyRow } from '../utils/buildOperationsDynamicsData';

/**
 * GET /admin/dashboard/operations-dynamics?audience=:
 * [{ day, operations_count }] — сутки по московскому времени.
 * audience: 'all' — все операции, 'users' — только пользователей (без админов).
 */
export const useAdminOperationsDynamics = (audience: AdminAudience = 'all') =>
  useQuery<DynamicsDailyRow[]>({
    queryKey: ['admin', 'operationsDynamics', audience],
    queryFn: async ({ signal }) =>
      (await api.get<DynamicsDailyRow[]>(
        `/admin/dashboard/operations-dynamics?audience=${audience}`,
        { signal },
      )) ?? [],
  });
