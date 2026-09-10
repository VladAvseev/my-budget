import { api } from '@/shared/api/http';
import type { AdminLogsMetrics, AdminLogsPeriod } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/logs/metrics: агрегаты по request_logs за выбранный период. */
export const useAdminLogsMetrics = (period: AdminLogsPeriod) =>
  useQuery<AdminLogsMetrics>({
    queryKey: ['admin', 'logs', 'metrics', period],
    queryFn: () => api.get<AdminLogsMetrics>(`/admin/logs/metrics?period=${period}`),
  });
