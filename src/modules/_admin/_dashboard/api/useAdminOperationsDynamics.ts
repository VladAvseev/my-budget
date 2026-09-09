import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';
import type { DynamicsDailyRow } from '../utils/buildOperationsDynamicsData';

/**
 * GET /admin/dashboard/operations-dynamics (порт admin_get_operations_dynamics):
 * [{ day, operations_count }] — сутки по московскому времени, как в RPC.
 */
export const useAdminOperationsDynamics = () =>
  useQuery<DynamicsDailyRow[]>({
    queryKey: ['admin', 'operationsDynamics'],
    queryFn: async () =>
      (await api.get<DynamicsDailyRow[]>('/admin/dashboard/operations-dynamics')) ?? [],
    refetchInterval: 60_000,
  });
