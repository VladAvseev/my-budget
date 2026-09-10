import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';
import type { DynamicsDailyRow } from '../utils/buildOperationsDynamicsData';

/**
 * GET /admin/dashboard/operations-dynamics:
 * [{ day, operations_count }] — сутки по московскому времени.
 */
export const useAdminOperationsDynamics = () =>
  useQuery<DynamicsDailyRow[]>({
    queryKey: ['admin', 'operationsDynamics'],
    queryFn: async () =>
      (await api.get<DynamicsDailyRow[]>('/admin/dashboard/operations-dynamics')) ?? [],
  });
