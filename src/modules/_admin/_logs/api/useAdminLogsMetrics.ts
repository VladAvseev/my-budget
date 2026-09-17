import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export type AdminLogsPeriod = '24h' | '7d' | '30d' | 'all';

export interface AdminLogEndpointStat {
  endpoint: string;
  count: number;
  avgDurationMs: number;
  errorCount: number;
}

export interface AdminLogsMetrics {
  period: AdminLogsPeriod;
  total: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;

  errorRate: number | null;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
  topSlowestEndpoints: AdminLogEndpointStat[];
  topErrorEndpoints: AdminLogEndpointStat[];
}

export type UseAdminLogsMetricsRequest = AdminLogsPeriod;

export type UseAdminLogsMetricsResponse = AdminLogsMetrics;

export const useAdminLogsMetrics = (period: UseAdminLogsMetricsRequest) =>
  useQuery<UseAdminLogsMetricsResponse>({
    queryKey: ['admin', 'logs', 'metrics', period],
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsMetricsResponse>(`/admin/logs/metrics?period=${period}`, { signal }),
    staleTime: 5 * 60_000,
  });
